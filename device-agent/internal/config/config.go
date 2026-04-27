package config

import (
	"os"

	"gopkg.in/yaml.v3"
)

type Config struct {
	APIBaseURL                string `yaml:"api_base_url"`
	AgentID                   string `yaml:"agent_id"`
	AgentToken                string `yaml:"agent_token"`
	SyncIntervalSeconds       int    `yaml:"sync_interval_seconds"`
	RetryMaxAttempts          int    `yaml:"retry_max_attempts"`
	RetryBaseDelaySeconds     int    `yaml:"retry_base_delay_seconds"`
	PerformanceIntervalSecs   int    `yaml:"performance_interval_seconds"`
	SoftwareScanIntervalHours int    `yaml:"software_scan_interval_hours"`
	SystemInfoIntervalHours   int    `yaml:"system_info_interval_hours"`
	ComplianceCheckIntervalH  int    `yaml:"compliance_check_interval_hours"`
	DBPath                    string `yaml:"db_path"`
	LogPath                   string `yaml:"log_path"`
}

func Load(path string) (*Config, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	cfg := &Config{
		SyncIntervalSeconds:       120,
		RetryMaxAttempts:          5,
		RetryBaseDelaySeconds:     10,
		PerformanceIntervalSecs:   300,
		SoftwareScanIntervalHours: 24,
		SystemInfoIntervalHours:   24,
		ComplianceCheckIntervalH:  12,
		DBPath:                    "agent.db",
		LogPath:                   "agent.log",
	}
	if err := yaml.Unmarshal(data, cfg); err != nil {
		return nil, err
	}
	return cfg, nil
}

func (c *Config) Save(path string) error {
	data, err := yaml.Marshal(c)
	if err != nil {
		return err
	}
	return os.WriteFile(path, data, 0600)
}
