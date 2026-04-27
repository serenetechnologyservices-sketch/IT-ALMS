package scheduler

import (
	"fmt"
	"sync"
	"time"

	"device-agent/internal/api"
	"device-agent/internal/collector"
	"device-agent/internal/compliance"
	"device-agent/internal/config"
	"device-agent/internal/db"
	"device-agent/internal/logger"
	syncengine "device-agent/internal/sync"
)

type Scheduler struct {
	cfg    *config.Config
	client *api.Client
	sync   *syncengine.Engine
	stop   chan struct{}
	mu     sync.RWMutex

	// Dynamic settings from server
	trackSystemInfo  bool
	trackSoftware    bool
	trackPerformance bool
	trackCompliance  bool
	sysInfoInterval  time.Duration
	softwareInterval time.Duration
	perfInterval     time.Duration
	compInterval     time.Duration
	syncInterval     time.Duration
}

func New(cfg *config.Config, client *api.Client) *Scheduler {
	return &Scheduler{
		cfg:              cfg,
		client:           client,
		sync:             syncengine.NewEngine(client, cfg),
		stop:             make(chan struct{}),
		trackSystemInfo:  true,
		trackSoftware:    true,
		trackPerformance: true,
		trackCompliance:  true,
		sysInfoInterval:  time.Duration(cfg.SystemInfoIntervalHours) * time.Hour,
		softwareInterval: time.Duration(cfg.SoftwareScanIntervalHours) * time.Hour,
		perfInterval:     time.Duration(cfg.PerformanceIntervalSecs) * time.Second,
		compInterval:     time.Duration(cfg.ComplianceCheckIntervalH) * time.Hour,
		syncInterval:     time.Duration(cfg.SyncIntervalSeconds) * time.Second,
	}
}

func (s *Scheduler) Start() {
	logger.Info("scheduler", "starting all scheduled tasks")

	// Fetch remote settings first
	s.fetchRemoteSettings()

	go s.runDynamic("system_info", func() time.Duration { return s.sysInfoInterval }, func() bool { return s.trackSystemInfo }, s.collectSystemInfo)
	go s.runDynamic("software", func() time.Duration { return s.softwareInterval }, func() bool { return s.trackSoftware }, s.collectSoftware)
	go s.runDynamic("performance", func() time.Duration { return s.perfInterval }, func() bool { return s.trackPerformance }, s.collectPerformance)
	go s.runDynamic("compliance", func() time.Duration { return s.compInterval }, func() bool { return s.trackCompliance }, s.checkCompliance)
	go s.runDynamic("sync", func() time.Duration { return s.syncInterval }, func() bool { return true }, s.sync.Run)

	// Periodically refresh settings from server (every 5 min)
	go s.runPeriodic("settings_refresh", 5*time.Minute, s.fetchRemoteSettings)

	// Run initial collections
	go func() {
		time.Sleep(2 * time.Second)
		s.mu.RLock()
		if s.trackSystemInfo { s.collectSystemInfo() }
		if s.trackSoftware { s.collectSoftware() }
		if s.trackPerformance { s.collectPerformance() }
		if s.trackCompliance { s.checkCompliance() }
		s.mu.RUnlock()
		s.sync.Run()
	}()
}

func (s *Scheduler) Stop() {
	close(s.stop)
}

func (s *Scheduler) fetchRemoteSettings() {
	settings, err := s.client.GetAgentSettings()
	if err != nil {
		logger.Warn("scheduler", "could not fetch remote settings, using local defaults: "+err.Error())
		return
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	s.trackSystemInfo = settings.Features.SystemInfo
	s.trackSoftware = settings.Features.Software
	s.trackPerformance = settings.Features.Performance
	s.trackCompliance = settings.Features.Compliance

	if settings.Intervals.SystemInfoMinutes > 0 {
		s.sysInfoInterval = time.Duration(settings.Intervals.SystemInfoMinutes) * time.Minute
	}
	if settings.Intervals.SoftwareMinutes > 0 {
		s.softwareInterval = time.Duration(settings.Intervals.SoftwareMinutes) * time.Minute
	}
	if settings.Intervals.PerformanceMinutes > 0 {
		s.perfInterval = time.Duration(settings.Intervals.PerformanceMinutes) * time.Minute
	}
	if settings.Intervals.ComplianceMinutes > 0 {
		s.compInterval = time.Duration(settings.Intervals.ComplianceMinutes) * time.Minute
	}
	if settings.Intervals.SyncMinutes > 0 {
		s.syncInterval = time.Duration(settings.Intervals.SyncMinutes) * time.Minute
	}

	logger.Info("scheduler", fmt.Sprintf("remote settings applied: sys=%v sw=%v perf=%v comp=%v sync=%v",
		s.trackSystemInfo, s.trackSoftware, s.trackPerformance, s.trackCompliance, s.syncInterval))
}

func (s *Scheduler) runDynamic(name string, getInterval func() time.Duration, isEnabled func() bool, fn func()) {
	for {
		interval := getInterval()
		select {
		case <-time.After(interval):
			s.mu.RLock()
			enabled := isEnabled()
			s.mu.RUnlock()
			if enabled {
				logger.Info("scheduler", fmt.Sprintf("running %s", name))
				fn()
			} else {
				logger.Info("scheduler", fmt.Sprintf("skipping %s (disabled)", name))
			}
		case <-s.stop:
			logger.Info("scheduler", fmt.Sprintf("stopping %s", name))
			return
		}
	}
}

func (s *Scheduler) runPeriodic(name string, interval time.Duration, fn func()) {
	ticker := time.NewTicker(interval)
	defer ticker.Stop()
	for {
		select {
		case <-ticker.C:
			fn()
		case <-s.stop:
			return
		}
	}
}

func (s *Scheduler) collectSystemInfo() {
	data, err := collector.CollectSystemData()
	if err != nil {
		logger.Error("collector", "system data collection failed", err)
		return
	}
	if err := db.StoreAndQueue("system_data", "system_info", data); err != nil {
		logger.Error("db", "failed to store system data", err)
	}
	logger.Info("collector", "system data collected")
}

func (s *Scheduler) collectSoftware() {
	data, err := collector.CollectSoftwareData()
	if err != nil {
		logger.Error("collector", "software collection failed", err)
		return
	}
	if err := db.StoreAndQueue("software_data", "software", data); err != nil {
		logger.Error("db", "failed to store software data", err)
	}
	logger.Info("collector", fmt.Sprintf("software collected: %d items", len(data.Software)))
}

func (s *Scheduler) collectPerformance() {
	data, err := collector.CollectPerformanceData()
	if err != nil {
		logger.Error("collector", "performance collection failed", err)
		return
	}
	if err := db.StoreAndQueue("performance_data", "performance", data); err != nil {
		logger.Error("db", "failed to store performance data", err)
	}
	logger.Info("collector", fmt.Sprintf("performance: CPU=%.1f%% MEM=%.1f%% DISK=%.1f%%", data.CPUUsagePct, data.MemUsagePct, data.DiskUsagePct))
}

func (s *Scheduler) checkCompliance() {
	swData, err := collector.CollectSoftwareData()
	if err != nil {
		logger.Error("compliance", "failed to collect software for compliance", err)
		return
	}
	result, err := compliance.CheckCompliance(s.client, swData)
	if err != nil {
		logger.Error("compliance", "compliance check failed", err)
		return
	}
	if err := db.StoreAndQueue("compliance_data", "compliance", result); err != nil {
		logger.Error("db", "failed to store compliance data", err)
	}
	logger.Info("compliance", fmt.Sprintf("status: %s, violations: %d", result.Status, len(result.Violations)))
}
