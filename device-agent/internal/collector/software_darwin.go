//go:build darwin

package collector

import (
	"os/exec"
	"strings"
	"time"

	"device-agent/internal/models"
)

func CollectSoftwareData() (*models.SoftwareData, error) {
	var items []models.SoftwareItem

	// system_profiler approach
	out, err := exec.Command("system_profiler", "SPApplicationsDataType", "-detailLevel", "mini").Output()
	if err == nil {
		lines := strings.Split(string(out), "\n")
		var current models.SoftwareItem
		for _, line := range lines {
			trimmed := strings.TrimSpace(line)
			if strings.HasSuffix(trimmed, ":") && !strings.Contains(trimmed, "Version") && !strings.Contains(trimmed, "Location") {
				if current.Name != "" {
					items = append(items, current)
				}
				current = models.SoftwareItem{Name: strings.TrimSuffix(trimmed, ":")}
			} else if strings.HasPrefix(trimmed, "Version:") {
				current.Version = strings.TrimSpace(strings.TrimPrefix(trimmed, "Version:"))
			} else if strings.HasPrefix(trimmed, "Obtained from:") {
				current.Publisher = strings.TrimSpace(strings.TrimPrefix(trimmed, "Obtained from:"))
			}
		}
		if current.Name != "" {
			items = append(items, current)
		}
	}

	// Fallback: list /Applications
	if len(items) == 0 {
		out, err := exec.Command("ls", "/Applications").Output()
		if err == nil {
			for _, name := range strings.Split(string(out), "\n") {
				name = strings.TrimSpace(name)
				if strings.HasSuffix(name, ".app") {
					items = append(items, models.SoftwareItem{
						Name: strings.TrimSuffix(name, ".app"),
					})
				}
			}
		}
	}

	return &models.SoftwareData{
		Software:    items,
		CollectedAt: time.Now().UTC().Format(time.RFC3339),
	}, nil
}
