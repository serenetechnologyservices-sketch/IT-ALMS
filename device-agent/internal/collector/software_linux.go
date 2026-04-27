//go:build linux

package collector

import (
	"os/exec"
	"strings"
	"time"

	"device-agent/internal/models"
)

func CollectSoftwareData() (*models.SoftwareData, error) {
	var items []models.SoftwareItem

	// Try dpkg first (Debian/Ubuntu)
	out, err := exec.Command("dpkg-query", "-W", "-f=${Package}\t${Version}\t${Maintainer}\n").Output()
	if err == nil {
		for _, line := range strings.Split(string(out), "\n") {
			parts := strings.SplitN(line, "\t", 3)
			if len(parts) >= 2 && parts[0] != "" {
				item := models.SoftwareItem{Name: parts[0], Version: parts[1]}
				if len(parts) >= 3 {
					item.Publisher = parts[2]
				}
				items = append(items, item)
			}
		}
	}

	// Fallback: rpm (RHEL/CentOS)
	if len(items) == 0 {
		out, err = exec.Command("rpm", "-qa", "--queryformat", "%{NAME}\t%{VERSION}\t%{VENDOR}\n").Output()
		if err == nil {
			for _, line := range strings.Split(string(out), "\n") {
				parts := strings.SplitN(line, "\t", 3)
				if len(parts) >= 2 && parts[0] != "" {
					item := models.SoftwareItem{Name: parts[0], Version: parts[1]}
					if len(parts) >= 3 {
						item.Publisher = parts[2]
					}
					items = append(items, item)
				}
			}
		}
	}

	return &models.SoftwareData{
		Software:    items,
		CollectedAt: time.Now().UTC().Format(time.RFC3339),
	}, nil
}
