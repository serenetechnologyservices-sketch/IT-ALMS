import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, DatePicker, Popconfirm, Tag, Space, Tooltip, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, PaperClipOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../api/axios';
import EntityAttachments from '../components/EntityAttachments';

export default function Contracts() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [assets, setAssets] = useState([]);
  const [attachModal, setAttachModal] = useState(null);
  const [form] = Form.useForm();

  const fetchData = async () => { setLoading(true); try { const r = await api.get('/contracts'); setData(r.data.data); } catch {} setLoading(false); };
  useEffect(() => {
    fetchData();
    api.get('/vendors?limit=200').then(r => setVendors(r.data.data)).catch(() => {});
    api.get('/assets?limit=200').then(r => setAssets(r.data.data)).catch(() => {});
  }, []);

  const handleSave = async () => {
    try {
      const v = await form.validateFields();
      const payload = { ...v, start_date: v.start_date?.format('YYYY-MM-DD'), end_date: v.end_date?.format('YYYY-MM-DD') };
      if (editing) await api.put(`/contracts/${editing.id}`, payload); else await api.post('/contracts', payload);
      message.success('Saved'); setModalOpen(false); fetchData();
    } catch (err) { message.error(err.response?.data?.error || 'Error'); }
  };

  const isExpiring = (d) => { const diff = (new Date(d) - new Date()) / (1000 * 60 * 60 * 24); return diff <= 30 && diff > 0; };

  const columns = [
    { title: 'Vendor', dataIndex: ['vendor', 'name'], key: 'vendor' },
    { title: 'Asset', dataIndex: ['asset', 'name'], key: 'asset', render: v => v || 'All' },
    { title: 'Type', dataIndex: 'contract_type', key: 'type', render: v => <Tag>{v?.toUpperCase()}</Tag> },
    { title: 'Start', dataIndex: 'start_date', key: 'start' },
    { title: 'End', dataIndex: 'end_date', key: 'end', render: v => <span style={{ color: isExpiring(v) ? '#ff4d4f' : undefined }}>{v} {isExpiring(v) && <Tag color="red">EXPIRING</Tag>}</span> },
    { title: 'Status', dataIndex: 'status', key: 'status', render: s => <Tag color={s === 'active' ? 'green' : 'red'}>{s?.toUpperCase()}</Tag> },
    { title: 'Actions', key: 'actions', render: (_, r) => (
      <Space>
        <Button icon={<EditOutlined />} size="small" onClick={() => { setEditing(r); form.setFieldsValue({ ...r, start_date: dayjs(r.start_date), end_date: dayjs(r.end_date) }); setModalOpen(true); }} />
        <Tooltip title="Attachments"><Button icon={<PaperClipOutlined />} size="small" onClick={() => setAttachModal(r)} /></Tooltip>
        <Popconfirm title="Delete?" onConfirm={async () => { await api.delete(`/contracts/${r.id}`); fetchData(); }}><Button icon={<DeleteOutlined />} size="small" danger /></Popconfirm>
      </Space>
    )},
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0 }}>Contracts</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); form.resetFields(); setModalOpen(true); }}>Add Contract</Button>
      </div>
      <Table columns={columns} dataSource={data} rowKey="id" loading={loading} />
      <Modal title={editing ? 'Edit Contract' : 'Add Contract'} open={modalOpen} onCancel={() => setModalOpen(false)} onOk={handleSave}>
        <Form form={form} layout="vertical">
          <Form.Item name="vendor_id" label="Vendor" rules={[{ required: true }]}><Select options={vendors.map(v => ({ value: v.id, label: v.name }))} /></Form.Item>
          <Form.Item name="asset_id" label="Asset (optional)"><Select allowClear options={assets.map(a => ({ value: a.id, label: a.name }))} /></Form.Item>
          <Form.Item name="contract_type" label="Type" rules={[{ required: true }]}><Select options={[{ value: 'warranty', label: 'Warranty' }, { value: 'amc', label: 'AMC' }]} /></Form.Item>
          <Form.Item name="start_date" label="Start Date" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="end_date" label="End Date" rules={[{ required: true }]}><DatePicker style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="description" label="Description"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>
      <Modal title={`Attachments — Contract #${attachModal?.id || ''}`} open={!!attachModal} onCancel={() => setAttachModal(null)} footer={null}>
        <EntityAttachments entityType="contracts" entityId={attachModal?.id} />
      </Modal>
    </div>
  );
}
