//go:build windows

package collector

import (
	"os/exec"
	"strings"
	"time"

	"device-agent/internal/models"
)

func CollectSoftwareData() (*models.SoftwareData, error) {
	var items []models.SoftwareItem

	// Use PowerShell to read from registry
	cmd := exec.Command("powershell", "-Command",
		`Get-ItemProperty HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*,HKLM:\Software\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\* -ErrorAction SilentlyContinue | Where-Object { $_.DisplayName } | Select-Object DisplayName,DisplayVersion,Publisher,InstallDate | ConvertTo-Csv -NoTypeInformation`)

	out, err := cmd.Output()
	if err != nil {
		return &models.SoftwareData{Software: items, CollectedAt: time.Now().UTC().Format(time.RFC3339)}, nil
	}

	lines := strings.Split(string(out), "\n")
	for i, line := range lines {
		if i == 0 { continue } // skip header
		line = strings.TrimSpace(line)
		if line == "" { continue }
		// Parse CSV: "Name","Version","Publisher","InstallDate"
		parts := parseCSVLine(line)
		if len(parts) >= 1 && parts[0] != "" {
			item := models.SoftwareItem{Name: parts[0]}
			if len(parts) >= 2 { item.Version = parts[1] }
			if len(parts) >= 3 { item.Publisher = parts[2] }
			if len(parts) >= 4 { item.InstallDate = parts[3] }
			items = append(items, item)
		}
	}

	return &models.SoftwareData{
		Software:    items,
		CollectedAt: time.Now().UTC().Format(time.RFC3339),
	}, nil
}

func parseCSVLine(line string) []string {
	var fields []string
	var current strings.Builder
	inQuotes := false
	for _, r := range line {
		if r == '"' {
			inQuotes = !inQuotes
		} else if r == ',' && !inQuotes {
			fields = append(fields, current.String())
			current.Reset()
		} else {
			current.WriteRune(r)
		}
	}
	fields = append(fields, current.String())
	return fields
}
