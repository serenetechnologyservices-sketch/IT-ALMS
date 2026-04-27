package compliance

import (
	"encoding/json"
	"strings"
	"time"

	"device-agent/internal/api"
	"device-agent/internal/models"
)

func CheckCompliance(client *api.Client, software *models.SoftwareData) (*models.ComplianceResult, error) {
	policyData, err := client.GetCompliancePolicies()
	if err != nil {
		// If can't reach server, return unknown
		return &models.ComplianceResult{
			Status:     "unknown",
			Violations: nil,
			CheckedAt:  time.Now().UTC().Format(time.RFC3339),
		}, nil
	}

	var resp struct {
		Data models.CompliancePolicy `json:"data"`
	}
	if err := json.Unmarshal(policyData, &resp); err != nil {
		return nil, err
	}
	policy := resp.Data

	var violations []models.ComplianceViolation
	installedNames := make(map[string]string) // name -> version (lowercase)

	for _, sw := range software.Software {
		lower := strings.ToLower(sw.Name)
		installedNames[lower] = sw.Version

		// Check blocked software
		for _, blocked := range policy.BlockedSoftware {
			if strings.Contains(lower, strings.ToLower(blocked)) {
				violations = append(violations, models.ComplianceViolation{
					Type:     "unauthorized_software",
					Software: sw.Name,
					Detail:   "Software is on the blocked list",
				})
			}
		}
	}

	// Check required software (allowed list treated as required)
	for _, required := range policy.AllowedSoftware {
		found := false
		for name := range installedNames {
			if strings.Contains(name, strings.ToLower(required)) {
				found = true
				break
			}
		}
		if !found {
			violations = append(violations, models.ComplianceViolation{
				Type:     "missing_required",
				Software: required,
				Detail:   "Required software not installed",
			})
		}
	}

	// Check version rules
	for sw, requiredVer := range policy.VersionRules {
		for name, ver := range installedNames {
			if strings.Contains(name, strings.ToLower(sw)) && ver != requiredVer {
				violations = append(violations, models.ComplianceViolation{
					Type:     "version_mismatch",
					Software: sw,
					Detail:   "Expected " + requiredVer + ", found " + ver,
				})
			}
		}
	}

	status := "compliant"
	if len(violations) > 0 {
		status = "non-compliant"
	}

	return &models.ComplianceResult{
		Status:     status,
		Violations: violations,
		CheckedAt:  time.Now().UTC().Format(time.RFC3339),
	}, nil
}
