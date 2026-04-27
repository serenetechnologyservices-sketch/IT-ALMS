import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Tag, Table, Progress, Spin, Button, message } from 'antd';
import { ReloadOutlined, CloudServerOutlined, DatabaseOutlined, ApiOutlined, DashboardOutlined } from '@ant-design/icons';
import api from '../api/axios';

export default function SystemMonitor() {
  const [system, setSystem] = useState(null);
  const [database, setDatabase] = useState(null);
  const [apiStats, setApiStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [sysRes, dbRes, apiRes] = await Promise.all([
        api.get('/monitor/system'),
        api.get('/monitor/database'),
        api.get('/monitor/api-stats').catch(() => ({ data: { data: null } })),
      ]);
      setSystem(sysRes.data.data);
      setDatabase(dbRes.data.data);
      setApiStats(apiRes.data.data);
    } catch { message.error('Failed to load monitoring data'); }
    setLoading(false);
  };

  useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t); }, []);

  if (loading && !system) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}><DashboardOutlined /> System Monitor</h2>
        <Button icon={<ReloadOutlined />} onClick={load} loading={loading}>Refresh</Button>
      </div>

      {/* Server Info */}
      {system && (
        <Card title={<><CloudServerOutlined /> Server</>} style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            <Col xs={12} md={6}><Statistic title="Uptime" value={system.server.uptime_human} /></Col>
            <Col xs={12} md={6}><Statistic title="Node.js" value={system.server.node_version} /></Col>
            <Col xs={12} md={6}><Statistic title="Platform" value={system.server.platform} /></Col>
            <Col xs={12} md={6}><Statistic title="Hostname" value={system.server.hostname} valueStyle={{ fontSize: 14 }} /></Col>
          </Row>
        </Card>
      )}

      {/* Memory & CPU */}
      {system && (
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col xs={24} md={12}>
            <Card title="Memory Usage">
              <Progress percent={system.memory.system_used_pct} status={system.memory.system_used_pct > 85 ? 'exception' : 'active'} />
              <Row gutter={16} style={{ marginTop: 12 }}>
                <Col span={8}><Statistic title="Heap Used" value={`${system.memory.heap_used_mb} MB`} valueStyle={{ fontSize: 16 }} /></Col>
                <Col span={8}><Statistic title="RSS" value={`${system.memory.rss_mb} MB`} valueStyle={{ fontSize: 16 }} /></Col>
                <Col span={8}><Statistic title="System Free" value={`${system.memory.system_free_mb} MB`} valueStyle={{ fontSize: 16 }} /></Col>
              </Row>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card title="CPU">
              <Row gutter={16}>
                <Col span={8}><Statistic title="Cores" value={system.cpu.cores} /></Col>
                <Col span={16}><Statistic title="Load Average (1m / 5m / 15m)" value={system.cpu.load_avg.join(' / ')} valueStyle={{ fontSize: 16 }} /></Col>
              </Row>
              <div style={{ marginTop: 12, color: '#666', fontSize: 12 }}>{system.cpu.model}</div>
            </Card>
          </Col>
        </Row>
      )}

      {/* Database */}
      {database && (
        <Card title={<><DatabaseOutlined /> Database</>} style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            <Col xs={8} md={4}><Statistic title="Assets" value={database.counts.assets} /></Col>
            <Col xs={8} md={4}><Statistic title="Tickets" value={database.counts.tickets} /></Col>
            <Col xs={8} md={4}><Statistic title="Users" value={database.counts.users} /></Col>
            <Col xs={8} md={4}><Statistic title="Allocations" value={database.counts.active_allocations} /></Col>
            <Col xs={8} md={4}><Statistic title="Pending SLA" value={database.counts.pending_sla} valueStyle={{ color: database.counts.pending_sla > 0 ? '#faad14' : '#52c41a' }} /></Col>
            <Col xs={8} md={4}>
              <Statistic title="DB Latency" value={`${database.database.latency_ms} ms`}
                valueStyle={{ color: database.database.latency_ms > 100 ? '#ff4d4f' : '#52c41a' }} />
            </Col>
          </Row>
          <div style={{ marginTop: 12 }}>
            <Tag color="green">{database.database.status}</Tag>
            <Tag>{database.database.dialect}</Tag>
          </div>
        </Card>
      )}

      {/* API Stats */}
      {apiStats && (
        <Card title={<><ApiOutlined /> API Stats</>}>
          <Row gutter={16}>
            <Col xs={8}><Statistic title="Total Requests" value={apiStats.total_requests} /></Col>
            <Col xs={8}><Statistic title="Errors" value={apiStats.total_errors} valueStyle={{ color: apiStats.total_errors > 0 ? '#ff4d4f' : '#52c41a' }} /></Col>
            <Col xs={8}><Statistic title="Error Rate" value={`${apiStats.error_rate_pct}%`} valueStyle={{ color: apiStats.error_rate_pct > 5 ? '#ff4d4f' : '#52c41a' }} /></Col>
          </Row>
          <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>Since: {new Date(apiStats.since).toLocaleString()}</div>
        </Card>
      )}
    </div>
  );
}
