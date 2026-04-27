import React, { useState, useEffect } from 'react';
import { Table, Button, Drawer, Modal, Form, Input, Select, Tag, Upload, Divider, Row, Col, InputNumber, Checkbox, Space, Timeline, Dropdown, Steps, Card, message } from 'antd';
import { PlusOutlined, UploadOutlined, MoreOutlined, EyeOutlined, SwapOutlined, StarOutlined, EditOutlined, ToolOutlined, AlertOutlined, FileSearchOutlined, HistoryOutlined, SettingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const STATUS_COLOR = { open: 'blue', assigned: 'cyan', in_progress: 'orange', waiting: 'purple', on_hold: 'gold', awaiting_parts: 'magenta', completed: 'lime', resolved: 'green', closed: 'default' };
const PRIORITY_COLOR = { low: 'default', medium: 'blue', high: 'orange', critical: 'red' };
const ALL_STATUSES = ['assigned','in_progress','waiting','on_hold','awaiting_parts','completed','resolved','closed','open'];
const TYPE_CONFIG = {
  incident: { color: 'red', label: 'INC', icon: '🔴' },
  service_request: { color: 'blue', label: 'SR', icon: '🔵' },
  change_request: { color: 'purple', label: 'CR', icon: '🟣' },
};

export default function Tickets() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createStep, setCreateStep] = useState(0);
  const [ticketType, setTicketType] = useState('incident');
  const [typeFilter, setTypeFilter] = useState(null);
  const [assets, setAssets] = useState([]);
  const [issueTypes, setIssueTypes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [problemTypes, setProblemTypes] = useState([]);
  const [partners, setPartners] = useState([]);
  const [engineers, setEngineers] = useState([]);
  const [users, setUsers] = useState([]);
  const [catalogItems, setCatalogItems] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('asset_user') || '{}');
  const isEmployee = user.role === 'Employee';
  const canAssign = ['Admin', 'Service Partner', 'Service Engineer'].includes(user.role);
  const canEdit = !isEmployee;

  const [activeModal, setActiveModal] = useState(null); // { type, record }
  const [modalForm] = Form.useForm();
  const [historyData, setHistoryData] = useState([]);

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (typeFilter) params.ticket_type = typeFilter;
      const res = await api.get('/tickets', { params });
      setData(res.data.data); setPagination({ current: page, pageSize: 20, total: res.data.pagination.total });
    } catch { message.error('Failed'); }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    api.get('/assets?limit=200').then(r => setAssets(r.data.data || [])).catch(() => {});
    api.get('/sub-masters/type/issue_type').then(r => setIssueTypes((r.data.data || []).map(d => ({ value: d.name, label: d.name })))).catch(() => {});
    api.get('/sub-masters/type/ticket_category').then(r => setCategories((r.data.data || []).map(d => ({ value: d.name, label: d.name })))).catch(() => {});
    api.get('/sub-masters/type/ticket_subcategory').then(r => setSubcategories((r.data.data || []).map(d => ({ value: d.name, label: d.name })))).catch(() => {});
    api.get('/sub-masters/type/problem_type').then(r => setProblemTypes((r.data.data || []).map(d => ({ value: d.name, label: d.name })))).catch(() => {});
    api.get('/service-partners').then(r => setPartners(r.data.data || [])).catch(() => {});
    api.get('/service-engineers').then(r => setEngineers(r.data.data || [])).catch(() => {});
    api.get('/users').then(r => setUsers(r.data.data || [])).catch(() => {});
    api.get('/catalog').then(r => setCatalogItems(r.data.data || [])).catch(() => {});
  }, []);

  useEffect(() => { fetchData(); }, [typeFilter]);

  // ── Handlers ──
  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      values.ticket_type = ticketType;
      const res = await api.post('/tickets', values);
      const ticketId = res.data.data.id;
      for (const file of fileList) {
        const fd = new FormData(); fd.append('file', file.originFileObj || file);
        await api.post(`/tickets/${ticketId}/attachments`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      message.success('Ticket created'); setDrawerOpen(false); setFileList([]); form.resetFields(); setCreateStep(0); fetchData();
    } catch (err) { message.error(err.response?.data?.error || 'Error'); }
  };

  const handleModalSubmit = async () => {
    if (!activeModal) return;
    const { type, record } = activeModal;
    try {
      const vals = await modalForm.validateFields();
      if (type === 'status') await api.put(`/tickets/${record.id}`, vals);
      else if (type === 'assign') await api.put(`/tickets/${record.id}/assign`, vals);
      else if (type === 'rating') await api.post(`/tickets/${record.id}/acknowledgement`, vals);
      else if (type === 'wp') await api.post(`/tickets/${record.id}/work-progress`, vals);
      else if (type === 'parts') await api.post(`/tickets/${record.id}/parts`, vals);
      else if (type === 'escalate') await api.post(`/tickets/${record.id}/escalate`, vals);
      else if (type === 'rca') await api.put(`/tickets/${record.id}/rca`, vals);
      message.success('Done'); setActiveModal(null); modalForm.resetFields(); fetchData();
    } catch (err) { message.error(err.response?.data?.error || 'Error'); }
  };

  const openModal = (type, record) => {
    modalForm.resetFields();
    if (type === 'rca') modalForm.setFieldsValue({ root_cause: record.root_cause || '' });
    if (type === 'history') {
      api.get(`/tickets/${record.id}`).then(r => { setHistoryData(r.data.data.updates || []); setActiveModal({ type, record }); }).catch(() => message.error('Failed'));
      return;
    }
    setActiveModal({ type, record });
  };

  // ── Action menu per row ──
  const getActions = (r) => {
    const items = [
      { key: 'view', icon: <EyeOutlined />, label: 'View Details' },
      { key: 'history', icon: <HistoryOutlined />, label: 'History' },
      { key: 'rating', icon: <StarOutlined />, label: 'Customer Rating' },
    ];
    if (canAssign && r.status !== 'closed') items.push({ key: 'assign', icon: <SwapOutlined />, label: 'Reassign' });
    if (canEdit && r.status !== 'closed') {
      items.push(
        { type: 'divider' },
        { key: 'status', icon: <EditOutlined />, label: 'Update Status' },
        { key: 'wp', icon: <ToolOutlined />, label: 'Work Progress' },
        { key: 'parts', icon: <SettingOutlined />, label: 'Spare Parts' },
        { key: 'escalate', icon: <AlertOutlined />, label: 'Escalate' },
        { key: 'rca', icon: <FileSearchOutlined />, label: 'Root Cause Analysis' },
      );
    }
    return items;
  };

  const onActionClick = (key, record) => {
    if (key === 'view') navigate(`/tickets/${record.id}`);
    else openModal(key, record);
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: 'Type', dataIndex: 'ticket_type', key: 'type', width: 70, render: t => {
      const c = TYPE_CONFIG[t] || {};
      return <Tag color={c.color || 'default'}>{c.label || t}</Tag>;
    }},
    { title: 'Title / Issue', key: 'title', ellipsis: true, render: (_, r) => r.title || r.issue_type || r.request_type || '-' },
    { title: 'Priority', dataIndex: 'priority', key: 'pri', width: 90, render: p => <Tag color={PRIORITY_COLOR[p]}>{p?.toUpperCase()}</Tag> },
    { title: 'Status', dataIndex: 'status', key: 'status', width: 120, render: s => <Tag color={STATUS_COLOR[s]}>{s?.replace(/_/g, ' ').toUpperCase()}</Tag> },
    { title: 'Created By', dataIndex: ['creator', 'full_name'], key: 'creator', width: 120 },
    { title: 'Partner', dataIndex: ['partner', 'name'], key: 'partner', width: 120, render: v => v || '-' },
    { title: '', key: 'actions', width: 50, fixed: 'right', render: (_, r) => (
      <Dropdown menu={{ items: getActions(r), onClick: ({ key }) => onActionClick(key, r) }} trigger={['click']}>
        <Button icon={<MoreOutlined />} type="text" size="small" />
      </Dropdown>
    )},
  ];

  // ── Modal content by type ──
  const renderModalContent = () => {
    if (!activeModal) return null;
    const { type } = activeModal;
    switch (type) {
      case 'status': return (
        <Form form={modalForm} layout="vertical">
          <Form.Item name="status" label="New Status" rules={[{ required: true }]}>
            <Select size="large" options={ALL_STATUSES.map(s => ({ value: s, label: s.replace(/_/g, ' ').toUpperCase() }))} />
          </Form.Item>
          <Form.Item name="comments" label="Comments"><Input.TextArea rows={3} /></Form.Item>
        </Form>
      );
      case 'assign': return (
        <Form form={modalForm} layout="vertical">
          <Form.Item name="partner_id" label="Service Partner"><Select allowClear size="large" options={partners.map(p => ({ value: p.id, label: p.name }))} /></Form.Item>
          <Form.Item name="engineer_id" label="Service Engineer"><Select allowClear size="large" options={engineers.map(e => ({ value: e.id, label: e.name }))} /></Form.Item>
        </Form>
      );
      case 'rating': return (
        <Form form={modalForm} layout="vertical">
          <Form.Item name="feedback_rating" label="Rating (1-5)"><InputNumber min={1} max={5} size="large" style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="closure_confirmed" label="Closure Confirmed" valuePropName="checked"><Checkbox>I confirm the issue is resolved</Checkbox></Form.Item>
          <Form.Item name="signature_data" label="Digital Signature"><Input size="large" placeholder="Enter your name as signature" /></Form.Item>
        </Form>
      );
      case 'wp': return (
        <Form form={modalForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}><Form.Item name="work_notes" label="Work Notes"><Input.TextArea rows={2} /></Form.Item></Col>
            <Col span={12}><Form.Item name="customer_comments" label="Customer Comments"><Input.TextArea rows={2} /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}><Form.Item name="technician_name" label="Technician"><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="technician_id" label="Tech ID"><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="visit_date" label="Visit Date"><Input type="date" /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="check_in_time" label="Check-in"><Input type="datetime-local" /></Form.Item></Col>
            <Col span={12}><Form.Item name="check_out_time" label="Check-out"><Input type="datetime-local" /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}><Form.Item name="root_cause" label="Root Cause"><Input.TextArea rows={2} /></Form.Item></Col>
            <Col span={8}><Form.Item name="resolution_summary" label="Resolution"><Input.TextArea rows={2} /></Form.Item></Col>
            <Col span={8}><Form.Item name="action_taken" label="Action"><Input.TextArea rows={2} /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="work_start_time" label="Work Start"><Input type="datetime-local" /></Form.Item></Col>
            <Col span={12}><Form.Item name="work_end_time" label="Work End"><Input type="datetime-local" /></Form.Item></Col>
          </Row>
        </Form>
      );
      case 'parts': return (
        <Form form={modalForm} layout="vertical">
          <Form.Item name="part_name" label="Part Name" rules={[{ required: true }]}><Input size="large" /></Form.Item>
          <Row gutter={16}>
            <Col span={8}><Form.Item name="quantity" label="Qty"><InputNumber min={1} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={8}><Form.Item name="cost" label="Cost"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={8}><Form.Item name="status" label="Status"><Select options={['used','pending','returned'].map(o => ({ value: o, label: o.toUpperCase() }))} /></Form.Item></Col>
          </Row>
        </Form>
      );
      case 'escalate': return (
        <Form form={modalForm} layout="vertical">
          <Form.Item name="escalation_level" label="Level" rules={[{ required: true }]}><Select size="large" options={[1,2,3].map(l => ({ value: l, label: `Level ${l}` }))} /></Form.Item>
          <Form.Item name="escalation_reason" label="Reason"><Input.TextArea rows={3} /></Form.Item>
          <Form.Item name="escalated_to" label="Escalate To" rules={[{ required: true }]}><Select size="large" showSearch optionFilterProp="label" options={users.map(u => ({ value: u.id, label: u.full_name }))} /></Form.Item>
        </Form>
      );
      case 'rca': return (
        <Form form={modalForm} layout="vertical">
          <Form.Item name="root_cause" label="Root Cause"><Input.TextArea rows={5} placeholder="Enter root cause analysis..." /></Form.Item>
        </Form>
      );
      case 'history': return historyData.length > 0 ? (
        <Timeline items={historyData.map(u => ({
          children: <><Tag color={STATUS_COLOR[u.new_status]}>{u.old_status} → {u.new_status}</Tag> {u.comments}<br/><small>{u.updater?.full_name} — {new Date(u.created_at).toLocaleString()}</small></>,
        }))} />
      ) : <p style={{ color: '#999' }}>No history yet.</p>;
      default: return null;
    }
  };

  const modalTitles = { status: 'Update Status', assign: 'Reassign Ticket', rating: 'Customer Rating', wp: 'Work Progress', parts: 'Add Spare Part', escalate: 'Escalate Ticket', rca: 'Root Cause Analysis', history: 'Ticket History' };

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Tickets</h2>
        <Space>
          <Select value={typeFilter} onChange={v => setTypeFilter(v)} allowClear placeholder="All Types" style={{ width: 180 }}
            options={Object.entries(TYPE_CONFIG).map(([k, v]) => ({ value: k, label: `${v.icon} ${k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}` }))} />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setFileList([]); setTicketType('incident'); setCreateStep(0); setDrawerOpen(true); }}>
            Create Ticket
          </Button>
        </Space>
      </div>

      <Table columns={columns} dataSource={data} rowKey="id" loading={loading} scroll={{ x: 900 }}
        pagination={{ ...pagination, onChange: p => fetchData(p), showSizeChanger: false, showTotal: t => `${t} tickets` }}
        size="middle" />

      {/* ── Create Ticket Drawer ── */}
      <Drawer title="Create Ticket" width={680} open={drawerOpen} onClose={() => setDrawerOpen(false)}
        extra={<Button type="primary" onClick={handleCreate}>Submit</Button>}>
        <Steps current={createStep} size="small" style={{ marginBottom: 24 }}
          items={[{ title: 'Type' }, { title: 'Details' }, { title: 'Attachments' }]} />

        <Form form={form} layout="vertical" size="large" preserve={true}>
          <div style={{ display: createStep === 0 ? 'block' : 'none' }}>
              <p style={{ color: '#666', marginBottom: 16 }}>Select the type of ticket you want to create:</p>
              <Row gutter={16}>
                {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
                  <Col span={8} key={key}>
                    <Card hoverable onClick={() => { setTicketType(key); setCreateStep(1); form.resetFields(); }}
                      style={{ textAlign: 'center', border: ticketType === key ? '2px solid #1890ff' : undefined, cursor: 'pointer' }}>
                      <div style={{ fontSize: 28 }}>{cfg.icon}</div>
                      <div style={{ fontWeight: 600, marginTop: 8 }}>{key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>

          <div style={{ display: createStep === 1 ? 'block' : 'none' }}>
              <Form.Item name="title" label="Title" rules={[{ required: ticketType === 'change_request' }]}><Input placeholder="Brief summary" /></Form.Item>
              <Form.Item name="description" label="Description" rules={[{ required: true }]}><Input.TextArea rows={3} placeholder="Describe the issue or request in detail" /></Form.Item>
              <Row gutter={16}>
                <Col span={12}><Form.Item name="priority" label="Priority"><Select placeholder="Select" options={['low','medium','high','critical'].map(p => ({ value: p, label: p.toUpperCase() }))} /></Form.Item></Col>
                <Col span={12}><Form.Item name="asset_id" label="Asset"><Select allowClear showSearch optionFilterProp="label" placeholder="Select asset" options={assets.map(a => ({ value: a.id, label: `${a.name} (${a.serial_number})` }))} /></Form.Item></Col>
              </Row>

              {ticketType === 'incident' && (<>
                <Divider orientation="left" plain>Classification</Divider>
                <Row gutter={16}>
                  <Col span={12}><Form.Item name="issue_type" label="Issue Type"><Select showSearch options={issueTypes} /></Form.Item></Col>
                  <Col span={6}><Form.Item name="urgency" label="Urgency"><Select allowClear options={['low','medium','high','critical'].map(p => ({ value: p, label: p.toUpperCase() }))} /></Form.Item></Col>
                  <Col span={6}><Form.Item name="impact" label="Impact"><Select allowClear options={['low','medium','high','critical'].map(p => ({ value: p, label: p.toUpperCase() }))} /></Form.Item></Col>
                </Row>
                <Row gutter={16}>
                  <Col span={8}><Form.Item name="category" label="Category"><Select allowClear showSearch options={categories} /></Form.Item></Col>
                  <Col span={8}><Form.Item name="subcategory" label="Subcategory"><Select allowClear showSearch options={subcategories} /></Form.Item></Col>
                  <Col span={8}><Form.Item name="problem_type" label="Problem Type"><Select allowClear showSearch options={problemTypes} /></Form.Item></Col>
                </Row>
              </>)}

              {ticketType === 'service_request' && (<>
                <Divider orientation="left" plain>Request Details</Divider>
                <Row gutter={16}>
                  <Col span={12}><Form.Item name="request_type" label="Request Type" rules={[{ required: true }]}><Select options={['Laptop','Desktop','Software','Access','Network','Other'].map(t => ({ value: t, label: t }))} /></Form.Item></Col>
                  <Col span={12}><Form.Item name="requested_for" label="Requested For"><Select allowClear showSearch optionFilterProp="label" options={users.map(u => ({ value: u.id, label: u.full_name }))} /></Form.Item></Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}><Form.Item name="catalog_item_id" label="Catalog Item"><Select allowClear showSearch optionFilterProp="label" options={catalogItems.map(c => ({ value: c.id, label: c.name }))} /></Form.Item></Col>
                  <Col span={6}><Form.Item name="quantity" label="Qty"><InputNumber min={1} style={{ width: '100%' }} /></Form.Item></Col>
                  <Col span={6}><Form.Item name="new_asset_flag" valuePropName="checked"><Checkbox style={{ marginTop: 30 }}>New asset</Checkbox></Form.Item></Col>
                </Row>
                <Form.Item name="justification" label="Justification"><Input.TextArea rows={2} /></Form.Item>
              </>)}

              {ticketType === 'change_request' && (<>
                <Divider orientation="left" plain>Change Details</Divider>
                <Row gutter={16}>
                  <Col span={8}><Form.Item name="change_type" label="Change Type" rules={[{ required: true }]}><Select options={['standard','normal','emergency'].map(t => ({ value: t, label: t.toUpperCase() }))} /></Form.Item></Col>
                  <Col span={8}><Form.Item name="risk_level" label="Risk"><Select options={['low','medium','high'].map(t => ({ value: t, label: t.toUpperCase() }))} /></Form.Item></Col>
                  <Col span={8}><Form.Item name="impact" label="Impact"><Select allowClear options={['low','medium','high','critical'].map(p => ({ value: p, label: p.toUpperCase() }))} /></Form.Item></Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}><Form.Item name="planned_start_date" label="Planned Start"><Input type="datetime-local" /></Form.Item></Col>
                  <Col span={12}><Form.Item name="planned_end_date" label="Planned End"><Input type="datetime-local" /></Form.Item></Col>
                </Row>
                <Form.Item name="impact_analysis" label="Impact Analysis"><Input.TextArea rows={2} /></Form.Item>
                <Form.Item name="rollback_plan" label="Rollback Plan"><Input.TextArea rows={2} /></Form.Item>
              </>)}

              <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between' }}>
                <Button onClick={() => setCreateStep(0)}>Back</Button>
                <Button type="primary" onClick={() => setCreateStep(2)}>Next: Attachments</Button>
              </div>
          </div>

          <div style={{ display: createStep === 2 ? 'block' : 'none' }}>
              <p style={{ color: '#666', marginBottom: 16 }}>Attach supporting files (images, PDFs, documents):</p>
              <Upload.Dragger fileList={fileList} onChange={({ fileList: fl }) => setFileList(fl)} beforeUpload={() => false} multiple>
                <p className="ant-upload-drag-icon"><UploadOutlined style={{ fontSize: 32, color: '#1890ff' }} /></p>
                <p>Click or drag files here to upload</p>
                <p style={{ color: '#999', fontSize: 12 }}>Max 10 MB per file. Images, PDF, Word documents.</p>
              </Upload.Dragger>
              <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between' }}>
                <Button onClick={() => setCreateStep(1)}>Back</Button>
                <Button type="primary" onClick={handleCreate}>Submit Ticket</Button>
              </div>
          </div>
        </Form>
      </Drawer>

      {/* ── Unified Action Modal ── */}
      <Modal title={`${modalTitles[activeModal?.type] || ''} — #${activeModal?.record?.id || ''}`}
        open={!!activeModal} onCancel={() => { setActiveModal(null); modalForm.resetFields(); }}
        width={activeModal?.type === 'wp' ? 700 : 500}
        footer={activeModal?.type === 'history' ? null : [
          <Button key="cancel" onClick={() => { setActiveModal(null); modalForm.resetFields(); }}>Cancel</Button>,
          <Button key="submit" type="primary" onClick={handleModalSubmit}>Submit</Button>,
        ]}>
        {renderModalContent()}
      </Modal>
    </div>
  );
}
