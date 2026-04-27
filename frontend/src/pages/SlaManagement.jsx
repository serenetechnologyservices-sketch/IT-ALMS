import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Select, InputNumber, Input, Switch, Popconfirm, Tag, Space, Tabs, Card, Row, Col, Statistic, Descriptions, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import api from '../api/axios';

const PRIORITY_COLOR = { low: 'default', medium: 'blue', high: 'orange', critical: 'red' };
const LEVEL_COLOR = { L1: 'purple', L2: 'blue', L3: 'cyan', L4: 'green' };
const LEVEL_LABEL = { L1: 'Vendor', L2: 'Category', L3: 'Subcategory', L4: 'Asset-Specific' };
const PIE_COLORS = ['#52c41a', '#ff4d4f', '#faad14'];

export default function SlaManagement() {
  const [slaRules, setSlaRules] = useState([]);
  const [reports, setReports] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [assets, setAssets] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [slaLevel, setSlaLevel] = useState('L2');
  const [form] = Form.useForm();
  const user = JSON.parse(localStorage.getItem('asset_user') || '{}');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [slaRes, repRes] = await Promise.all([api.get('/sla/master'), api.get('/sla/reports')]);
      setSlaRules(slaRes.data.data || []); setReports(repRes.data.data || null);
      if (['Admin', 'CIO'].includes(user.role)) {
        const insRes = await api.get('/sla/insights'); setInsights(insRes.data.data || null);
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
    api.get('/assets/categories').then(r => setCategories(r.data.data || [])).catch(() => {});
    api.get('/vendors?limit=200').then(r => setVendors(r.data.data || [])).catch(() => {});
    api.get('/assets?limit=200').then(r => setAssets(r.data.data || [])).catch(() => {});
    api.get('/sub-masters/type/ticket_subcategory').then(r => setSubcategories((r.data.data || []).map(d => ({ value: d.name, label: d.name })))).catch(() => {});
  }, []);

  const handleSave = async () => {
    try {
      const v = await form.validateFields();
      v.sla_level = slaLevel;
      if (editing) await api.put(`/sla/master/${editing.id}`, v);
      else await api.post('/sla/master', v);
      message.success('Saved'); setModalOpen(false); fetchAll();
    } catch (err) { message.error(err.response?.data?.error || 'Error'); }
  };

  const openAdd = () => { setEditing(null); form.resetFields(); setSlaLevel('L2'); setModalOpen(true); };
  const openEdit = (r) => { setEditing(r); setSlaLevel(r.sla_level || 'L2'); form.setFieldsValue(r); setModalOpen(true); };

  const slaColumns = [
    { title: 'Name', dataIndex: 'name', render: v => v || '-' },
    { title: 'Level', dataIndex: 'sla_level', width: 110, render: l => <Tag color={LEVEL_COLOR[l]}>{LEVEL_LABEL[l] || l}</Tag> },
    { title: 'Priority', dataIndex: 'priority', render: p => <Tag color={PRIORITY_COLOR[p]}>{p?.toUpperCase()}</Tag> },
    { title: 'Category', dataIndex: ['category', 'name'], render: v => v || 'All' },
    { title: 'Response', dataIndex: 'response_time_hours', render: v => `${v} hrs` },
    { title: 'Resolution', dataIndex: 'resolution_time_hours', render: v => `${v} hrs` },
    { title: 'Ack', dataIndex: 'acknowledgement_time_hours', render: v => v ? `${v} hrs` : '-' },
    { title: 'Hours', dataIndex: 'business_hours_only', width: 80, render: v => v ? <Tag color="blue">Biz</Tag> : <Tag>24x7</Tag> },
    { title: 'Start', dataIndex: 'start_condition', width: 100, render: v => v?.replace('on_', '').replace('_', ' ') },
    { title: 'Actions', key: 'actions', width: 100, render: (_, r) => (
      <Space>
        <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(r)} />
        <Popconfirm title="Delete?" onConfirm={async () => { await api.delete(`/sla/master/${r.id}`); fetchAll(); }}>
          <Button icon={<DeleteOutlined />} size="small" danger />
        </Popconfirm>
      </Space>
    )},
  ];

  const tabItems = [
    { key: 'rules', label: 'SLA Rules', children: (
      <div>
        {user.role === 'Admin' && (
          <div style={{ marginBottom: 16, textAlign: 'right' }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>Add SLA Rule</Button>
          </div>
        )}
        <Table columns={slaColumns} dataSource={slaRules} rowKey="id" loading={loading} pagination={false} size="small" scroll={{ x: 900 }} />
      </div>
    )},
    { key: 'dashboard', label: 'SLA Dashboard', children: reports ? (
      <div>
        <Row gutter={[16, 16]}>
          <Col xs={12} md={6}><Card><Statistic title="Total Tracked" value={reports.total_tracked} /></Card></Col>
          <Col xs={12} md={6}><Card><Statistic title="Compliance %" value={`${reports.compliance_pct}%`} valueStyle={{ color: reports.compliance_pct >= 80 ? '#52c41a' : '#ff4d4f' }} /></Card></Col>
          <Col xs={12} md={6}><Card><Statistic title="Breached" value={(reports.response?.breached || 0) + (reports.resolution?.breached || 0)} valueStyle={{ color: '#ff4d4f' }} /></Card></Col>
          <Col xs={12} md={6}><Card><Statistic title="Near Breach" value={reports.near_breach_count || 0} valueStyle={{ color: '#faad14' }} /></Card></Col>
        </Row>
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          {['Response', 'Resolution', 'Acknowledgement'].map(type => {
            const key = type.toLowerCase();
            const d = reports[key];
            if (!d) return null;
            return (
              <Col xs={24} md={8} key={type}>
                <Card title={`${type} SLA`}>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart><Pie data={[{ name: 'Met', value: d.met || 0 }, { name: 'Breached', value: d.breached || 0 }, { name: 'Pending', value: d.pending || 0 }]} dataKey="value" cx="50%" cy="50%" outerRadius={70} label>
                      {PIE_COLORS.map((c, i) => <Cell key={i} fill={c} />)}
                    </Pie><Tooltip /><Legend /></PieChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
            );
          })}
        </Row>
      </div>
    ) : <div>No SLA data yet</div> },
    { key: 'insights', label: 'Insights', children: insights ? (
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card title="Partner Compliance">
            <ResponsiveContainer width="100%" height={250}><BarChart data={insights.partner_compliance || []}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis domain={[0, 100]} /><Tooltip /><Bar dataKey="compliance_pct" fill="#1890ff" /></BarChart></ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Breaches by Category">
            <ResponsiveContainer width="100%" height={250}><BarChart data={insights.breaches_by_category || []}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="category" tick={{ fontSize: 11 }} /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="count" fill="#ff4d4f" /></BarChart></ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24}>
          <Card title="Tickets Likely to Breach">
            {(insights.likely_to_breach || []).length > 0 ? (
              <Table size="small" pagination={false} dataSource={insights.likely_to_breach} rowKey="ticket_id" columns={[
                { title: 'Ticket', dataIndex: 'ticket_id' },
                { title: 'Priority', dataIndex: 'priority', render: p => <Tag color={PRIORITY_COLOR[p]}>{p?.toUpperCase()}</Tag> },
                { title: 'Time Left', dataIndex: 'remaining_minutes', render: m => <Tag color={m <= 15 ? 'red' : 'orange'}>{m} min</Tag> },
              ]} />
            ) : <div style={{ color: '#999' }}>No tickets at risk</div>}
          </Card>
        </Col>
      </Row>
    ) : <div style={{ color: '#999' }}>Available for Admin and CIO</div> },
  ];

  return (
    <div>
      <h2>SLA Management</h2>
      <Tabs items={tabItems} />
      <Modal title={editing ? 'Edit SLA Rule' : 'Add SLA Rule'} open={modalOpen} onCancel={() => setModalOpen(false)} onOk={handleSave} width={650}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Rule Name"><Input placeholder="e.g. Critical Server SLA" /></Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="SLA Level">
                <Select value={slaLevel} onChange={setSlaLevel} options={[
                  { value: 'L1', label: 'L1 — Vendor-based' },
                  { value: 'L2', label: 'L2 — Category-based' },
                  { value: 'L3', label: 'L3 — Subcategory-based' },
                  { value: 'L4', label: 'L4 — Asset-specific' },
                ]} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="priority" label="Priority" rules={[{ required: true }]}>
                <Select options={['low', 'medium', 'high', 'critical'].map(p => ({ value: p, label: p.toUpperCase() }))} />
              </Form.Item>
            </Col>
          </Row>
          {slaLevel === 'L1' && <Form.Item name="vendor_id" label="Vendor"><Select allowClear options={vendors.map(v => ({ value: v.id, label: v.name }))} /></Form.Item>}
          {slaLevel === 'L2' && <Form.Item name="asset_category_id" label="Asset Category"><Select allowClear placeholder="All categories" options={categories.map(c => ({ value: c.id, label: c.name }))} /></Form.Item>}
          {slaLevel === 'L3' && <Form.Item name="subcategory" label="Subcategory"><Select allowClear showSearch options={subcategories} /></Form.Item>}
          {slaLevel === 'L4' && <Form.Item name="asset_id" label="Specific Asset"><Select allowClear showSearch optionFilterProp="label" options={assets.map(a => ({ value: a.id, label: `${a.name} (${a.serial_number})` }))} /></Form.Item>}
          <Row gutter={16}>
            <Col span={8}><Form.Item name="response_time_hours" label="Response (hrs)" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} min={0.25} step={0.5} /></Form.Item></Col>
            <Col span={8}><Form.Item name="resolution_time_hours" label="Resolution (hrs)" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} min={0.5} step={1} /></Form.Item></Col>
            <Col span={8}><Form.Item name="acknowledgement_time_hours" label="Ack (hrs)"><InputNumber style={{ width: '100%' }} min={0.25} step={0.25} /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}><Form.Item name="start_condition" label="Start Condition"><Select options={[{ value: 'on_creation', label: 'On Creation' }, { value: 'on_assignment', label: 'On Assignment' }, { value: 'on_in_progress', label: 'On In Progress' }]} /></Form.Item></Col>
            <Col span={8}><Form.Item name="business_hours_only" label="Business Hours Only" valuePropName="checked"><Switch /></Form.Item></Col>
            <Col span={8}><Form.Item name="pause_on_statuses" label="Pause On Statuses"><Input placeholder="waiting,on_hold" /></Form.Item></Col>
          </Row>
          {form.getFieldValue('business_hours_only') && (
            <Row gutter={16}>
              <Col span={12}><Form.Item name="business_start_hour" label="Start Hour"><InputNumber min={0} max={23} style={{ width: '100%' }} /></Form.Item></Col>
              <Col span={12}><Form.Item name="business_end_hour" label="End Hour"><InputNumber min={0} max={23} style={{ width: '100%' }} /></Form.Item></Col>
            </Row>
          )}
        </Form>
      </Modal>
    </div>
  );
}
