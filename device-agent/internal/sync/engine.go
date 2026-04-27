package sync

import (
	"fmt"
	"math"
	"time"

	"device-agent/internal/api"
	"device-agent/internal/config"
	"device-agent/internal/db"
	"device-agent/internal/logger"
)

type Engine struct {
	client *api.Client
	cfg    *config.Config
}

func NewEngine(client *api.Client, cfg *config.Config) *Engine {
	return &Engine{client: client, cfg: cfg}
}

func (e *Engine) Run() {
	if !e.client.IsReachable() {
		logger.Warn("sync", "API not reachable, skipping sync")
		return
	}

	records, err := db.GetUnsyncedRecords(50)
	if err != nil {
		logger.Error("sync", "failed to get unsynced records", err)
		return
	}

	if len(records) == 0 {
		return
	}

	logger.Info("sync", fmt.Sprintf("syncing %d records", len(records)))

	for _, r := range records {
		var lastErr error
		for attempt := 0; attempt < e.cfg.RetryMaxAttempts; attempt++ {
			err := e.client.SyncData(r.DataType, r.Payload)
			if err == nil {
				db.MarkSynced(r.ID)
				logger.Info("sync", fmt.Sprintf("synced record %d (%s)", r.ID, r.DataType))
				lastErr = nil
				break
			}
			lastErr = err
			delay := time.Duration(math.Pow(2, float64(attempt))) * time.Duration(e.cfg.RetryBaseDelaySeconds) * time.Second
			logger.Warn("sync", fmt.Sprintf("retry %d for record %d, waiting %v", attempt+1, r.ID, delay))
			time.Sleep(delay)
		}
		if lastErr != nil {
			logger.Error("sync", fmt.Sprintf("failed to sync record %d after %d attempts", r.ID, e.cfg.RetryMaxAttempts), lastErr)
		}
	}
}
