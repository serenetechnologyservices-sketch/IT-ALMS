import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Descriptions, Tag, Timeline, Card, Button, Select, Input, Space, Spin, Row, Col, Statistic, Form, InputNumber, Rate, Checkbox, Table, Divider, message } from 'antd';
import { ArrowLeftOutlined, ClockCircleOutlined } from '@ant-design/icons';
import api from '../api/axios';

const STATUS_COLOR = { open: 'blue', assigned: 'cyan', in_progress: 'orange', waiting: 'purple', on_hold: 'gold', awaiting_parts: 'magenta', completed: 'lime', resolved: 'green', closed: 'default' };
const ALL_STATUSES = ['assigned','in_progress','waiting','on_hold','awaiting_parts','completed','resolved','closed','open'];

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState('');
  const [comments, setComments] = useState('');
  const [partners, setPartners] = useState([]);
  const [engineers, setEngineers] = useState([]);
  const [users, setUsers] = useState([]);
  const [assignTo, setAssignTo] = useState({});
  const [sla, setSla] = useState(null);
  const [rcaText, setRcaText] = useState('');
  const [wpForm] = Form.useForm();
  const [partForm] = Form.useForm();
  const [ackForm] = Form.useForm();
  const [escForm] = Form.useForm();
  const user = JSON.parse(localStorage.getItem('asset_user') || '{}');
  const isEmployee = user.role === 'Employee';
  const canEdit = !isEmployee;
  const canAssign = ['Admin', 'Service Partner', 'Service Engineer'].includes(user.role);

  const load = async () => {
    try {
      const res = await api.get(`/tickets/${id}`);
      setTicket(res.data.data);
      setRcaText(res.data.data.root_cause || '');
      try { const slaRes = await api.get(`/sla/ticket/${id}`); setSla(slaRes.data.data); } catch {}
      if (canAssign) {
        const [pRes, eRes] = await Promise.all([api.get('/service-partners'), api.get('/service-engineers')]);
        setPartners(pRes.data.data); setEngineers(eRes.data.data);
      }
      if (canEdit) api.get('/users').then(r => setUsers(r.data.data || [])).catch(() => {});
    } catch { message.error('Failed'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const handleUpdate = async () => {
    try { await api.put(`/tickets/${id}`, { status: newStatus, comments }); message.success('Updated'); setNewStatus(''); setComments(''); load(); }
    catch (err) { message.error(err.response?.data?.error || 'Error'); }
  };
  const handleAssign = async () => {
    try { await api.put(`/tickets/${id}/assign`, assignTo); message.success('Assigned'); load(); }
    catch (err) { message.error(err.response?.data?.error || 'Error'); }
  };
  const handleRca = async () => {
    try { await api.put(`/tickets/${id}/rca`, { root_cause: rcaText }); message.success('RCA saved'); load(); }
    catch (err) { message.error(err.response?.data?.error || 'Error'); }
  };
  const handleWorkProgress = async () => {
    try {
      const vals = await wpForm.validateFields();
      await api.post(`/tickets/${id}/work-progress`, vals);
      message.success('Work progress added'); wpForm.resetFields(); load();
    } catch (err) { message.error(err.response?.data?.error || 'Error'); }
  };
  const handleAddPart = async () => {
    try {
      const vals = await partForm.validateFields();
      await api.post(`/tickets/${id}/parts`, vals);
      message.success('Part added'); partForm.resetFields(); load();
    } catch (err) { message.error(err.response?.data?.error || 'Error'); }
  };
  const handlePartStatus = async (pid, status) => {
    try { await api.put(`/tickets/${id}/parts/${pid}`, { status }); message.success('Updated'); load(); }
    catch (err) { message.error('Error'); }
  };
  const handleAck = async () => {
    try {
      const vals = await ackForm.validateFields();
      await api.post(`/tickets/${id}/acknowledgement`, vals);
      message.success('Acknowledgement saved'); load();
    } catch (err) { message.error(err.response?.data?.error || 'Error'); }
  };
  const handleEscalate = async () => {
    try {
      const vals = await escForm.validateFields();
      await api.post(`/tickets/${id}/escalate`, vals);
      message.success('Escalated'); escForm.resetFields(); load();
    } catch (err) { message.error(err.response?.data?.error || 'Error'); }
  };

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;
  if (!ticket) return <div>Ticket not found</div>;

  return (
    <div>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/tickets')} style={{ marginBottom: 16 }}>Back</Button>
      <h2>Ticket #{ticket.id} {ticket.title ? `— ${ticket.title}` : ''}</h2>

      {/* Core Details */}
      <Card style={{ marginBottom: 16 }}>
        <Descriptions bordered column={2} size="small">
          <Descriptions.Item label="Asset">{ticket.asset?.name}</Descriptions.Item>
          <Descriptions.Item label="Status"><Tag color={STATUS_COLOR[ticket.status]}>{ticket.status?.replace(/_/g, ' ').toUpperCase()}</Tag></Descriptions.Item>
          <Descriptions.Item label="Issue Type">{ticket.issue_type}</Descriptions.Item>
          <Descriptions.Item label="Priority"><Tag>{ticket.priority?.toUpperCase()}</Tag></Descriptions.Item>
          <Descriptions.Item label="Description" span={2}>{ticket.description}</Descriptions.Item>
          <Descriptions.Item label="Created By">{ticket.creator?.full_name}</Descriptions.Item>
          <Descriptions.Item label="Partner">{ticket.partner?.name || '-'}</Descriptions.Item>
          <Descriptions.Item label="Engineer">{ticket.engineer?.name || '-'}</Descriptions.Item>
          <Descriptions.Item label="Reopen Count">{ticket.reopen_count || 0}</Descriptions.Item>
          {ticket.category && <Descriptions.Item label="Category">{ticket.category}</Descriptions.Item>}
          {ticket.subcategory && <Descriptions.Item label="Subcategory">{ticket.subcategory}</Descriptions.Item>}
          {ticket.problem_type && <Descriptions.Item label="Problem Type">{ticket.problem_type}</Descriptions.Item>}
          {ticket.urgency && <Descriptions.Item label="Urgency">{ticket.urgency?.toUpperCase()}</Descriptions.Item>}
          {ticket.order_number && <Descriptions.Item label="Order #">{ticket.order_number}</Descriptions.Item>}
          {ticket.invoice_number && <Descriptions.Item label="Invoice #">{ticket.invoice_number}</Descriptions.Item>}
          {ticket.complaint_reference && <Descriptions.Item label="Complaint Ref">{ticket.complaint_reference}</Descriptions.Item>}
          {ticket.contract_id && <Descriptions.Item label="Contract ID">{ticket.contract_id}</Descriptions.Item>}
          {ticket.region && <Descriptions.Item label="Region">{ticket.region}</Descriptions.Item>}
          {ticket.zone && <Descriptions.Item label="Zone">{ticket.zone}</Descriptions.Item>}
        </Descriptions>
      </Card>

      {/* Attachments — view only for all */}
      {ticket.attachments?.length > 0 && (
        <Card title="Attachments" style={{ marginBottom: 16 }}>
          {ticket.attachments.map(a => (
            <Tag key={a.id} style={{ marginBottom: 4 }}>{a.file_name} ({(a.file_size / 1024).toFixed(1)} KB)</Tag>
          ))}
        </Card>
      )}

      {/* SLA Tracking — view only for all */}
      {sla && (
        <Card title={<><ClockCircleOutlined /> SLA Tracking</>} style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            <Col xs={12} md={6}>
              <Statistic title="Response SLA"
                value={sla.response_indicator === 'met' ? 'Met' : sla.response_indicator === 'breached' ? 'Breached' : sla.response_remaining_minutes != null ? `${sla.response_remaining_minutes} min` : 'N/A'}
                valueStyle={{ color: sla.response_indicator === 'met' || sla.response_indicator === 'on_track' ? '#52c41a' : sla.response_indicator === 'near_breach' ? '#faad14' : '#ff4d4f' }} />
            </Col>
            <Col xs={12} md={6}>
              <Statistic title="Resolution SLA"
                value={sla.resolution_indicator === 'met' ? 'Met' : sla.resolution_indicator === 'breached' ? 'Breached' : sla.resolution_remaining_minutes != null ? `${sla.resolution_remaining_minutes} min` : 'N/A'}
                valueStyle={{ color: sla.resolution_indicator === 'met' || sla.resolution_indicator === 'on_track' ? '#52c41a' : sla.resolution_indicator === 'near_breach' ? '#faad14' : '#ff4d4f' }} />
            </Col>
            <Col xs={12} md={6}><Statistic title="Response Due" value={sla.response_due_time ? new Date(sla.response_due_time).toLocaleString() : '-'} valueStyle={{ fontSize: 14 }} /></Col>
            <Col xs={12} md={6}><Statistic title="Resolution Due" value={sla.resolution_due_time ? new Date(sla.resolution_due_time).toLocaleString() : '-'} valueStyle={{ fontSize: 14 }} /></Col>
          </Row>
        </Card>
      )}

      {/* Assign / Reassign Ticket — Admin (on open), Service Partner & Engineer (on any non-closed) */}
      {canAssign && ticket.status !== 'closed' && (
        <Card title={ticket.status === 'open' ? 'Assign Ticket' : 'Reassign Ticket'} style={{ marginBottom: 16 }}>
          <Space>
            <Select placeholder="Service Partner" style={{ width: 200 }} allowClear onChange={v => setAssignTo(p => ({ ...p, partner_id: v }))} options={partners.map(p => ({ value: p.id, label: p.name }))} />
            <Select placeholder="Service Engineer" style={{ width: 200 }} allowClear onChange={v => setAssignTo(p => ({ ...p, engineer_id: v }))} options={engineers.map(e => ({ value: e.id, label: e.name }))} />
            <Button type="primary" onClick={handleAssign}>{ticket.status === 'open' ? 'Assign' : 'Reassign'}</Button>
          </Space>
        </Card>
      )}

      {/* Update Status — NOT for Employee */}
      {canEdit && (
        <Card title="Update Status" style={{ marginBottom: 16 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Select placeholder="New Status" style={{ width: 200 }} value={newStatus || undefined} onChange={setNewStatus}
              options={ALL_STATUSES.map(s => ({ value: s, label: s.replace(/_/g, ' ').toUpperCase() }))} />
            <Input.TextArea rows={2} placeholder="Comments" value={comments} onChange={e => setComments(e.target.value)} />
            <Button type="primary" onClick={handleUpdate} disabled={!newStatus}>Update</Button>
          </Space>
        </Card>
      )}

      {/* RCA — Employee: read-only view; Others: editable */}
      <Card title="Root Cause Analysis" style={{ marginBottom: 16 }}>
        {canEdit ? (
          <>
            <Input.TextArea rows={3} value={rcaText} onChange={e => setRcaText(e.target.value)} placeholder="Enter root cause analysis..." />
            <Button type="primary" style={{ marginTop: 8 }} onClick={handleRca}>Save RCA</Button>
          </>
        ) : (
          <p>{ticket.root_cause || 'No RCA recorded yet.'}</p>
        )}
      </Card>

      {/* Work Progress — Employee: read-only history; Others: history + add form */}
      <Card title="Work Progress" style={{ marginBottom: 16 }}>
        {ticket.workProgress?.length > 0 ? (
          <div style={{ marginBottom: 16 }}>
            {ticket.workProgress.map(wp => (
              <Card key={wp.id} size="small" style={{ marginBottom: 8 }}>
                {wp.work_notes && <p><strong>Work Notes:</strong> {wp.work_notes}</p>}
                {wp.customer_comments && <p><strong>Customer Comments:</strong> {wp.customer_comments}</p>}
                {wp.technician_name && <p><strong>Technician:</strong> {wp.technician_name} ({wp.technician_id})</p>}
                {wp.visit_date && <p><strong>Visit:</strong> {wp.visit_date}</p>}
                {wp.root_cause && <p><strong>Root Cause:</strong> {wp.root_cause}</p>}
                {wp.resolution_summary && <p><strong>Resolution:</strong> {wp.resolution_summary}</p>}
                {wp.action_taken && <p><strong>Action:</strong> {wp.action_taken}</p>}
                {wp.total_effort_hours && <p><strong>Effort:</strong> {wp.total_effort_hours} hrs</p>}
                <small>{new Date(wp.created_at).toLocaleString()}</small>
              </Card>
            ))}
          </div>
        ) : (
          <p>No work progress recorded yet.</p>
        )}
        {canEdit && (
          <>
            <Divider plain>Add Work Progress</Divider>
            <Form form={wpForm} layout="vertical">
              <Row gutter={16}>
                <Col span={12}><Form.Item name="work_notes" label="Work Notes"><Input.TextArea rows={2} /></Form.Item></Col>
                <Col span={12}><Form.Item name="customer_comments" label="Customer Comments"><Input.TextArea rows={2} /></Form.Item></Col>
              </Row>
              <Row gutter={16}>
                <Col span={8}><Form.Item name="technician_name" label="Technician Name"><Input /></Form.Item></Col>
                <Col span={8}><Form.Item name="technician_id" label="Technician ID"><Input /></Form.Item></Col>
                <Col span={8}><Form.Item name="visit_date" label="Visit Date"><Input type="date" /></Form.Item></Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}><Form.Item name="check_in_time" label="Check-in Time"><Input type="datetime-local" /></Form.Item></Col>
                <Col span={12}><Form.Item name="check_out_time" label="Check-out Time"><Input type="datetime-local" /></Form.Item></Col>
              </Row>
              <Row gutter={16}>
                <Col span={8}><Form.Item name="root_cause" label="Root Cause"><Input.TextArea rows={2} /></Form.Item></Col>
                <Col span={8}><Form.Item name="resolution_summary" label="Resolution Summary"><Input.TextArea rows={2} /></Form.Item></Col>
                <Col span={8}><Form.Item name="action_taken" label="Action Taken"><Input.TextArea rows={2} /></Form.Item></Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}><Form.Item name="work_start_time" label="Work Start"><Input type="datetime-local" /></Form.Item></Col>
                <Col span={12}><Form.Item name="work_end_time" label="Work End"><Input type="datetime-local" /></Form.Item></Col>
              </Row>
              <Button type="primary" onClick={handleWorkProgress}>Add Progress</Button>
            </Form>
          </>
        )}
      </Card>

      {/* Spare Parts — Employee: read-only table; Others: table + add/edit */}
      <Card title="Spare Parts" style={{ marginBottom: 16 }}>
        {ticket.parts?.length > 0 ? (
          <Table size="small" dataSource={ticket.parts} rowKey="id" pagination={false} style={{ marginBottom: 16 }}
            columns={[
              { title: 'Part', dataIndex: 'part_name' },
              { title: 'Qty', dataIndex: 'quantity' },
              { title: 'Cost', dataIndex: 'cost' },
              { title: 'Status', dataIndex: 'status', render: (s, r) => canEdit ? (
                <Select size="small" value={s} style={{ width: 120 }} onChange={v => handlePartStatus(r.id, v)}
                  options={['used','pending','returned'].map(o => ({ value: o, label: o.toUpperCase() }))} />
              ) : <Tag>{s?.toUpperCase()}</Tag> },
            ]}
          />
        ) : (
          <p>No spare parts recorded yet.</p>
        )}
        {canEdit && (
          <Form form={partForm} layout="inline">
            <Form.Item name="part_name" rules={[{ required: true }]}><Input placeholder="Part name" /></Form.Item>
            <Form.Item name="quantity"><InputNumber min={1} placeholder="Qty" /></Form.Item>
            <Form.Item name="cost"><InputNumber min={0} placeholder="Cost" /></Form.Item>
            <Form.Item name="status"><Select style={{ width: 120 }} options={['used','pending','returned'].map(o => ({ value: o, label: o.toUpperCase() }))} placeholder="Status" /></Form.Item>
            <Button type="primary" onClick={handleAddPart}>Add Part</Button>
          </Form>
        )}
      </Card>

      {/* Customer Acknowledgement — Employee CAN submit (rating + closure) */}
      <Card title="Customer Acknowledgement" style={{ marginBottom: 16 }}>
        {ticket.acknowledgement && (
          <Descriptions size="small" bordered column={2} style={{ marginBottom: 16 }}>
            <Descriptions.Item label="Rating"><Rate disabled value={ticket.acknowledgement.feedback_rating} /></Descriptions.Item>
            <Descriptions.Item label="Closure Confirmed">{ticket.acknowledgement.closure_confirmed ? 'Yes' : 'No'}</Descriptions.Item>
            <Descriptions.Item label="Signature">{ticket.acknowledgement.signature_data ? 'Captured' : 'N/A'}</Descriptions.Item>
          </Descriptions>
        )}
        <Form form={ackForm} layout="vertical">
          <Row gutter={16}>
            <Col span={8}><Form.Item name="feedback_rating" label="Rating (1-5)"><InputNumber min={1} max={5} /></Form.Item></Col>
            <Col span={8}><Form.Item name="closure_confirmed" label="Closure Confirmed" valuePropName="checked"><Checkbox>Confirmed</Checkbox></Form.Item></Col>
            <Col span={8}><Form.Item name="signature_data" label="Signature (text)"><Input placeholder="Digital signature" /></Form.Item></Col>
          </Row>
          <Button type="primary" onClick={handleAck}>Save Acknowledgement</Button>
        </Form>
      </Card>

      {/* Escalation — Employee: read-only history; Others: history + escalate form */}
      <Card title="Escalation" style={{ marginBottom: 16 }}>
        {ticket.escalations?.length > 0 ? (
          <Timeline style={{ marginBottom: 16 }} items={ticket.escalations.map(e => ({
            children: <><Tag color="red">Level {e.escalation_level}</Tag> {e.escalation_reason} <br/><small>{new Date(e.created_at).toLocaleString()}</small></>,
          }))} />
        ) : (
          <p>No escalations recorded.</p>
        )}
        {canEdit && (
          <Form form={escForm} layout="inline">
            <Form.Item name="escalation_level" rules={[{ required: true }]}>
              <Select style={{ width: 120 }} placeholder="Level" options={[1,2,3].map(l => ({ value: l, label: `Level ${l}` }))} />
            </Form.Item>
            <Form.Item name="escalation_reason"><Input placeholder="Reason" /></Form.Item>
            <Form.Item name="escalated_to" rules={[{ required: true }]}>
              <Select style={{ width: 200 }} placeholder="Escalate to" showSearch optionFilterProp="label"
                options={users.map(u => ({ value: u.id, label: u.full_name }))} />
            </Form.Item>
            <Button type="primary" danger onClick={handleEscalate}>Escalate</Button>
          </Form>
        )}
      </Card>

      {/* History — view only for all */}
      <Card title="History">
        <Timeline items={(ticket.updates || []).map(u => ({
          children: <><Tag color={STATUS_COLOR[u.new_status]}>{u.old_status} → {u.new_status}</Tag> {u.comments} <br/><small>{u.updater?.full_name} - {new Date(u.created_at).toLocaleString()}</small></>,
        }))} />
      </Card>
    </div>
  );
}
