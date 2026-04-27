import React, { useState, useEffect } from 'react';
import { Card, Form, Switch, InputNumber, Button, Row, Col, Divider, Spin, Tag, Descriptions, message } from 'antd';
import { SettingOutlined, SyncOutlined, DesktopOutlined, AppstoreOutlined, DashboardOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import api from '../api/axios';

export default function AgentSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const fetchSettings = async () => {
    try {
      const res = await api.get('/agent-settings');
      setSettings(res.data.data);
      form.setFieldsValue(res.data.data);
    } catch { message.error('Failed to load settings'); }
    setLoading(false);
  };

  useEffect(() => { fetchSettings(); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const values = await form.validateFields();
      await api.put('/agent-settings', values);
      message.success('Agent settings saved. Agents will pick up changes on next sync.');
      fetchSettings();
    } catch (err) { message.error(err.response?.data?.error || 'Error saving'); }
    setSaving(false);
  };

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}><SettingOutlined /> Agent Settings</h2>
        <Button type="primary" icon={<SyncOutlined />} loading={saving} onClick={handleSave}>Save Settings</Button>
      </div>

      <Form form={form} layout="vertical" initialValues={settings}>
        {/* Feature Toggles */}
        <Card title="Feature Tracking" style={{ marginBottom: 16 }}>
          <p style={{ color: '#666', marginBottom: 16 }}>Enable or disable what the device agent collects. Disabled features will not run on any agent.</p>
          <Row gutter={[32, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Card size="small" style={{ textAlign: 'center' }}>
                <DesktopOutlined style={{ fontSize: 28, color: '#1890ff', marginBottom: 8 }} />
                <div style={{ fontWeight: 500, marginBottom: 8 }}>System Info</div>
                <div style={{ color: '#666', fontSize: 12, marginBottom: 8 }}>Hostname, OS, CPU, RAM, Disk</div>
                <Form.Item name="track_system_info" valuePropName="checked" style={{ marginBottom: 0 }}>
                  <Switch checkedChildren="ON" unCheckedChildren="OFF" />
                </Form.Item>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card size="small" style={{ textAlign: 'center' }}>
                <AppstoreOutlined style={{ fontSize: 28, color: '#52c41a', marginBottom: 8 }} />
                <div style={{ fontWeight: 500, marginBottom: 8 }}>Software Inventory</div>
                <div style={{ color: '#666', fontSize: 12, marginBottom: 8 }}>Installed apps, versions, publishers</div>
                <Form.Item name="track_software" valuePropName="checked" style={{ marginBottom: 0 }}>
                  <Switch checkedChildren="ON" unCheckedChildren="OFF" />
                </Form.Item>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card size="small" style={{ textAlign: 'center' }}>
                <DashboardOutlined style={{ fontSize: 28, color: '#faad14', marginBottom: 8 }} />
                <div style={{ fontWeight: 500, marginBottom: 8 }}>Performance</div>
                <div style={{ color: '#666', fontSize: 12, marginBottom: 8 }}>CPU, Memory, Disk usage %</div>
                <Form.Item name="track_performance" valuePropName="checked" style={{ marginBottom: 0 }}>
                  <Switch checkedChildren="ON" unCheckedChildren="OFF" />
                </Form.Item>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card size="small" style={{ textAlign: 'center' }}>
                <SafetyCertificateOutlined style={{ fontSize: 28, color: '#ff4d4f', marginBottom: 8 }} />
                <div style={{ fontWeight: 500, marginBottom: 8 }}>Compliance</div>
                <div style={{ color: '#666', fontSize: 12, marginBottom: 8 }}>Policy checks, violations</div>
                <Form.Item name="track_compliance" valuePropName="checked" style={{ marginBottom: 0 }}>
                  <Switch checkedChildren="ON" unCheckedChildren="OFF" />
                </Form.Item>
              </Card>
            </Col>
          </Row>
        </Card>

        {/* Sync Intervals */}
        <Card title="Collection & Sync Intervals" style={{ marginBottom: 16 }}>
          <p style={{ color: '#666', marginBottom: 16 }}>Configure how often each feature collects data and how often the agent syncs with the server.</p>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item name="system_info_interval_min" label="System Info Interval (minutes)"
                rules={[{ required: true }, { type: 'number', min: 1 }]}
                extra="Default: 1440 (once daily)">
                <InputNumber style={{ width: '100%' }} min={1} max={10080} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item name="software_scan_interval_min" label="Software Scan Interval (minutes)"
                rules={[{ required: true }, { type: 'number', min: 1 }]}
                extra="Default: 1440 (once daily)">
                <InputNumber style={{ width: '100%' }} min={1} max={10080} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item name="performance_interval_min" label="Performance Interval (minutes)"
                rules={[{ required: true }, { type: 'number', min: 1 }]}
                extra="Default: 5 (every 5 min)">
                <InputNumber style={{ width: '100%' }} min={1} max={1440} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item name="compliance_interval_min" label="Compliance Check Interval (minutes)"
                rules={[{ required: true }, { type: 'number', min: 1 }]}
                extra="Default: 720 (every 12 hours)">
                <InputNumber style={{ width: '100%' }} min={1} max={10080} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item name="sync_interval_min" label="Sync Interval (minutes)"
                rules={[{ required: true }, { type: 'number', min: 1 }]}
                extra="How often agent pushes data to server">
                <InputNumber style={{ width: '100%' }} min={1} max={1440} />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Current Config Summary */}
        <Card title="Current Active Configuration">
          <Descriptions bordered size="small" column={2}>
            <Descriptions.Item label="System Info">{settings?.track_system_info ? <Tag color="green">ENABLED</Tag> : <Tag color="red">DISABLED</Tag>}</Descriptions.Item>
            <Descriptions.Item label="Interval">{settings?.system_info_interval_min} min</Descriptions.Item>
            <Descriptions.Item label="Software Scan">{settings?.track_software ? <Tag color="green">ENABLED</Tag> : <Tag color="red">DISABLED</Tag>}</Descriptions.Item>
            <Descriptions.Item label="Interval">{settings?.software_scan_interval_min} min</Descriptions.Item>
            <Descriptions.Item label="Performance">{settings?.track_performance ? <Tag color="green">ENABLED</Tag> : <Tag color="red">DISABLED</Tag>}</Descriptions.Item>
            <Descriptions.Item label="Interval">{settings?.performance_interval_min} min</Descriptions.Item>
            <Descriptions.Item label="Compliance">{settings?.track_compliance ? <Tag color="green">ENABLED</Tag> : <Tag color="red">DISABLED</Tag>}</Descriptions.Item>
            <Descriptions.Item label="Interval">{settings?.compliance_interval_min} min</Descriptions.Item>
            <Descriptions.Item label="Sync Interval" span={2}>{settings?.sync_interval_min} min</Descriptions.Item>
          </Descriptions>
        </Card>
      </Form>
    </div>
  );
}
