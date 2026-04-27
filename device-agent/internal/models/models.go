package models

import "time"

type SystemData struct {
	Hostname    string  `json:"hostname"`
	OS          string  `json:"os"`
	OSVersion   string  `json:"os_version"`
	CPUModel    string  `json:"cpu_model"`
	CPUCores    int     `json:"cpu_cores"`
	TotalRAMGB  float64 `json:"total_ram_gb"`
	TotalDiskGB float64 `json:"total_disk_gb"`
	UsedDiskGB  float64 `json:"used_disk_gb"`
	CollectedAt string  `json:"collected_at"`
}

type SoftwareItem struct {
	Name        string `json:"name"`
	Version     string `json:"version"`
	Publisher   string `json:"publisher"`
	InstallDate string `json:"install_date"`
}

type SoftwareData struct {
	Software    []SoftwareItem `json:"software"`
	CollectedAt string         `json:"collected_at"`
}

type PerformanceData struct {
	CPUUsagePct  float64 `json:"cpu_usage_pct"`
	MemUsagePct  float64 `json:"mem_usage_pct"`
	DiskUsagePct float64 `json:"disk_usage_pct"`
	CollectedAt  string  `json:"collected_at"`
}

type CompliancePolicy struct {
	AllowedSoftware []string          `json:"allowed_software"`
	BlockedSoftware []string          `json:"blocked_software"`
	VersionRules    map[string]string `json:"version_rules"`
}

type ComplianceViolation struct {
	Type     string `json:"type"`
	Software string `json:"software"`
	Detail   string `json:"detail"`
}

type ComplianceResult struct {
	Status      string                `json:"compliance_status"`
	Violations  []ComplianceViolation `json:"violations"`
	CheckedAt   string                `json:"checked_at"`
}

type SyncRecord struct {
	ID        int64
	DataType  string
	Payload   string
	CreatedAt time.Time
	Synced    bool
}
