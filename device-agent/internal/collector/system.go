package collector

import (
	"fmt"
	"os"
	"runtime"
	"time"

	"device-agent/internal/models"

	"github.com/shirou/gopsutil/v3/cpu"
	"github.com/shirou/gopsutil/v3/disk"
	"github.com/shirou/gopsutil/v3/host"
	"github.com/shirou/gopsutil/v3/mem"
)

func CollectSystemData() (*models.SystemData, error) {
	hostname, _ := os.Hostname()

	hostInfo, err := host.Info()
	if err != nil {
		return nil, fmt.Errorf("host info: %w", err)
	}

	cpuInfo, err := cpu.Info()
	if err != nil {
		return nil, fmt.Errorf("cpu info: %w", err)
	}
	cpuModel := ""
	if len(cpuInfo) > 0 {
		cpuModel = cpuInfo[0].ModelName
	}

	memInfo, err := mem.VirtualMemory()
	if err != nil {
		return nil, fmt.Errorf("mem info: %w", err)
	}

	diskRoot := "/"
	if runtime.GOOS == "windows" {
		diskRoot = "C:\\"
	}
	diskInfo, err := disk.Usage(diskRoot)
	if err != nil {
		return nil, fmt.Errorf("disk info: %w", err)
	}

	return &models.SystemData{
		Hostname:    hostname,
		OS:          hostInfo.Platform,
		OSVersion:   hostInfo.PlatformVersion,
		CPUModel:    cpuModel,
		CPUCores:    runtime.NumCPU(),
		TotalRAMGB:  float64(memInfo.Total) / (1024 * 1024 * 1024),
		TotalDiskGB: float64(diskInfo.Total) / (1024 * 1024 * 1024),
		UsedDiskGB:  float64(diskInfo.Used) / (1024 * 1024 * 1024),
		CollectedAt: time.Now().UTC().Format(time.RFC3339),
	}, nil
}
