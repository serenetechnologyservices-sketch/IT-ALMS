import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Descriptions, Tag, Tabs, Timeline, Card, Statistic, Row, Col, Table, Spin, Button, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import api from '../api/axios';

const STATUS_COLOR = { available: 'green', allocated: 'blue', repair: 'orange', scrap: 'red' };

export default function AssetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [asset, setAsset] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [health, setHealth] = useState(null);
  const [financials, setFinancials] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [aRes, tRes] = await Promise.all([api.get(`/assets/${id}`), api.get(`/assets/${id}/timeline`)]);
        setAsset(aRes.data.data); setTimeline(tRes.data.data);
        try { const hRes = await api.get(`/intelligence/health/${id}`); setHealth(hRes.data.data); } catch {}
        try { const fRes = await api.get(`/financial/asset/${id}`); setFinancials(fRes.data.data); } catch {}
        try { const lRes = await api.get(`/agent?asset_id=${id}&log_type=software`); setLogs(lRes.data.data); } catch {}
      } catch { message.error('Failed to load asset'); }
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;
  if (!asset) return <div>Asset not found</div>;

  const items = [
    { key: 'details', label: 'Details', children: (
      <Descriptions bordered column={2} size="small">
        <Descriptions.Item label="Name">{asset.name}</Descriptions.Item>
        <Descriptions.Item label="Category">{asset.category?.name}</Descriptions.Item>
        <Descriptions.Item label="Serial Number">{asset.serial_number}</Descriptions.Item>
        <Descriptions.Item label="Status"><Tag color={STATUS_COLOR[asset.status]}>{asset.status?.toUpperCase()}</Tag></Descriptions.Item>
        <Descriptions.Item label="Configuration" span={2}>{asset.configuration}</Descriptions.Item>
        <Descriptions.Item label="Purchase Date">{asset.purchase_date}</Descriptions.Item>
        <Descriptions.Item label="Purchase Cost">₹{Number(asset.purchase_cost).toLocaleString()}</Descriptions.Item>
        <Descriptions.Item label="Vendor">{asset.vendor?.name || '-'}</Descriptions.Item>
        <Descriptions.Item label="QR Code">{asset.qr_code}</Descriptions.Item>
      </Descriptions>
    )},
    { key: 'timeline', label: 'Timeline', children: (
      <Timeline mode="left" items={timeline.map(t => ({
        label: new Date(t.created_at).toLocaleDateString(),
        children: <><Tag>{t.event_type}</Tag> {t.description} <br/><small>by {t.performer?.full_name}</small></>,
      }))} />
    )},
    { key: 'health', label: 'Health', children: health ? (
      <Row gutter={16}>
        <Col span={8}><Card><Statistic title="Health Score" value={health.health_score} suffix="/ 100" valueStyle={{ color: health.health_score >= 70 ? '#52c41a' : health.health_score >= 40 ? '#faad14' : '#ff4d4f' }} /></Card></Col>
        <Col span={8}><Card><Statistic title="Open Tickets" value={health.open_tickets} /></Card></Col>
        <Col span={8}><Card><Statistic title="Recent Usage" value={health.has_recent_usage ? 'Yes' : 'No'} /></Card></Col>
      </Row>
    ) : <div>No health data available</div> },
    { key: 'financial', label: 'Financial', children: financials ? (
      <Row gutter={16}>
        <Col span={6}><Card><Statistic title="Purchase Cost" value={`₹${financials.purchase_cost?.toLocaleString()}`} /></Card></Col>
        <Col span={6}><Card><Statistic title="Current Value" value={`₹${financials.current_value?.toLocaleString()}`} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="Annual Depreciation" value={`₹${financials.annual_depreciation?.toLocaleString()}`} valueStyle={{ color: '#faad14' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="Maintenance Cost" value={`₹${financials.maintenance_cost?.toLocaleString()}`} valueStyle={{ color: '#ff4d4f' }} /></Card></Col>
      </Row>
    ) : <div>No financial data available</div> },
    { key: 'software', label: 'Software', children: (
      <Table dataSource={logs} rowKey="id" pagination={false} columns={[
        { title: 'Date', dataIndex: 'created_at', render: v => new Date(v).toLocaleString() },
        { title: 'Data', dataIndex: 'data', render: v => <pre style={{ margin: 0, fontSize: 12 }}>{JSON.stringify(v, null, 2)}</pre> },
      ]} />
    )},
  ];

  return (
    <div>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/assets')} style={{ marginBottom: 16 }}>Back to Assets</Button>
      <h2>{asset.name}</h2>
      <Tabs items={items} />
    </div>
  );
}
