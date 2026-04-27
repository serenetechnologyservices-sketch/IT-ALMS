package collector

import (
	"fmt"
	"runtime"
	"time"

	"device-agent/internal/models"

	"github.com/shirou/gopsutil/v3/cpu"
	"github.com/shirou/gopsutil/v3/disk"
	"github.com/shirou/gopsutil/v3/mem"
)

func CollectPerformanceData() (*models.PerformanceData, error) {
	cpuPct, err := cpu.Percent(time.Second, false)
	if err != nil {
		return nil, fmt.Errorf("cpu percent: %w", err)
	}
	cpuUsage := 0.0
	if len(cpuPct) > 0 {
		cpuUsage = cpuPct[0]
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

	return &models.PerformanceData{
		CPUUsagePct:  cpuUsage,
		MemUsagePct:  memInfo.UsedPercent,
		DiskUsagePct: diskInfo.UsedPercent,
		CollectedAt:  time.Now().UTC().Format(time.RFC3339),
	}, nil
}
