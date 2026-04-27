package api

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"device-agent/internal/config"
	"device-agent/internal/logger"
)

type Client struct {
	baseURL    string
	token      string
	httpClient *http.Client
}

func NewClient(cfg *config.Config) *Client {
	return &Client{
		baseURL: cfg.APIBaseURL,
		token:   cfg.AgentToken,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

func (c *Client) SetToken(token string) {
	c.token = token
}

func (c *Client) post(endpoint string, data interface{}) ([]byte, error) {
	body, err := json.Marshal(data)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequest("POST", c.baseURL+endpoint, bytes.NewBuffer(body))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	if c.token != "" {
		req.Header.Set("Authorization", "Bearer "+c.token)
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)
	if resp.StatusCode >= 400 {
		return respBody, fmt.Errorf("HTTP %d: %s", resp.StatusCode, string(respBody))
	}
	return respBody, nil
}

func (c *Client) get(endpoint string) ([]byte, error) {
	req, err := http.NewRequest("GET", c.baseURL+endpoint, nil)
	if err != nil {
		return nil, err
	}
	if c.token != "" {
		req.Header.Set("Authorization", "Bearer "+c.token)
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	if resp.StatusCode >= 400 {
		return body, fmt.Errorf("HTTP %d: %s", resp.StatusCode, string(body))
	}
	return body, nil
}

func (c *Client) IsReachable() bool {
	_, err := c.get("/health")
	return err == nil
}

func (c *Client) Register(hostname, os, agentID string) (string, error) {
	payload := map[string]string{"hostname": hostname, "os": os, "agent_id": agentID}
	resp, err := c.post("/agent/register", payload)
	if err != nil {
		return "", err
	}
	var result struct {
		Token string `json:"token"`
	}
	json.Unmarshal(resp, &result)
	return result.Token, nil
}

func (c *Client) PostSystemInfo(data interface{}) error {
	_, err := c.post("/agent/system-info", data)
	return err
}

func (c *Client) PostSoftware(data interface{}) error {
	_, err := c.post("/agent/software", data)
	return err
}

func (c *Client) PostPerformance(data interface{}) error {
	_, err := c.post("/agent/usage", data)
	return err
}

func (c *Client) PostCompliance(data interface{}) error {
	_, err := c.post("/agent/compliance", data)
	return err
}

func (c *Client) GetCompliancePolicies() ([]byte, error) {
	return c.get("/compliance/policies")
}

func (c *Client) SyncData(dataType string, payload string) error {
	var data interface{}
	json.Unmarshal([]byte(payload), &data)

	var err error
	switch dataType {
	case "system_info":
		err = c.PostSystemInfo(data)
	case "software":
		err = c.PostSoftware(data)
	case "performance":
		err = c.PostPerformance(data)
	case "compliance":
		err = c.PostCompliance(data)
	default:
		err = fmt.Errorf("unknown data type: %s", dataType)
	}

	if err != nil {
		logger.Error("api", fmt.Sprintf("sync %s failed", dataType), err)
	}
	return err
}

type RemoteSettings struct {
	Features struct {
		SystemInfo  bool `json:"system_info"`
		Software    bool `json:"software"`
		Performance bool `json:"performance"`
		Compliance  bool `json:"compliance"`
	} `json:"features"`
	Intervals struct {
		SystemInfoMinutes  int `json:"system_info_minutes"`
		SoftwareMinutes    int `json:"software_minutes"`
		PerformanceMinutes int `json:"performance_minutes"`
		ComplianceMinutes  int `json:"compliance_minutes"`
		SyncMinutes        int `json:"sync_minutes"`
	} `json:"intervals"`
}

func (c *Client) GetAgentSettings() (*RemoteSettings, error) {
	body, err := c.get("/agent-settings/agent-config")
	if err != nil {
		return nil, err
	}
	var resp struct {
		Success bool           `json:"success"`
		Data    RemoteSettings `json:"data"`
	}
	if err := json.Unmarshal(body, &resp); err != nil {
		return nil, err
	}
	return &resp.Data, nil
}
