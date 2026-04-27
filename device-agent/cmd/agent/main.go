package main

import (
	"flag"
	"fmt"
	"os"
	"os/signal"
	"syscall"

	"device-agent/internal/api"
	"device-agent/internal/config"
	"device-agent/internal/db"
	"device-agent/internal/logger"
	"device-agent/internal/scheduler"
)

func main() {
	configPath := flag.String("config", "config.yaml", "Path to config file")
	flag.Parse()

	// Load config
	cfg, err := config.Load(*configPath)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Failed to load config: %v\n", err)
		os.Exit(1)
	}

	// Init logger
	if err := logger.Init(cfg.LogPath); err != nil {
		fmt.Fprintf(os.Stderr, "Failed to init logger: %v\n", err)
		os.Exit(1)
	}
	logger.Info("main", "Device Agent starting")

	// Init database
	if err := db.Init(cfg.DBPath); err != nil {
		logger.Error("main", "Failed to init database", err)
		os.Exit(1)
	}
	logger.Info("main", "Database initialized")

	// Init API client
	client := api.NewClient(cfg)

	// Register if no token
	if cfg.AgentToken == "" {
		logger.Info("main", "No agent token, attempting registration")
		hostname, _ := os.Hostname()
		token, err := client.Register(hostname, "auto", cfg.AgentID)
		if err != nil {
			logger.Warn("main", "Registration failed (will work offline): "+err.Error())
		} else if token != "" {
			cfg.AgentToken = token
			client.SetToken(token)
			cfg.Save(*configPath)
			logger.Info("main", "Registered successfully")
		}
	}

	// Start scheduler
	sched := scheduler.New(cfg, client)
	sched.Start()
	logger.Info("main", "Scheduler started - agent is running")

	// Wait for shutdown signal
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
	<-sigChan

	logger.Info("main", "Shutdown signal received, stopping...")
	sched.Stop()
	logger.Info("main", "Agent stopped")
}
