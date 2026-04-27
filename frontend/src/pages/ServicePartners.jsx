import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Popconfirm, Tag, Space, Tooltip, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, PaperClipOutlined } from '@ant-design/icons';
import api from '../api/axios';
import EntityAttachments from '../components/EntityAttachments';

export default function ServicePartners() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [attachModal, setAttachModal] = useState(null);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [form] = Form.useForm();

  const fetchData = async () => { setLoading(true); try { const r = await api.get('/service-partners'); setData(r.data.data); } catch {} setLoading(false); };
  useEffect(() => {
    fetchData();
    api.get('/sub-masters/type/service_type').then(r => setServiceTypes((r.data.data || []).map(d => ({ value: d.name, label: d.name })))).catch(() => {});
  }, []);

  const handleSave = async () => {
    try {
      const v = await form.validateFields();
      if (editing) await api.put(`/service-partners/${editing.id}`, v); else await api.post('/service-partners', v);
      message.success('Saved'); setModalOpen(false); fetchData();
    } catch (err) { message.error(err.response?.data?.error || 'Error'); }
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Contact', dataIndex: 'contact_person', key: 'contact' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Phone', dataIndex: 'phone', key: 'phone' },
    { title: 'Service Type', dataIndex: 'service_type', key: 'type' },
    { title: 'Status', dataIndex: 'status', key: 'status', render: s => <Tag color={s === 'active' ? 'green' : 'red'}>{s?.toUpperCase()}</Tag> },
    { title: 'Actions', key: 'actions', width: 150, render: (_, r) => (
      <Space>
        <Button icon={<EditOutlined />} size="small" onClick={() => { setEditing(r); form.setFieldsValue(r); setModalOpen(true); }} />
        <Tooltip title="Attachments"><Button icon={<PaperClipOutlined />} size="small" onClick={() => setAttachModal(r)} /></Tooltip>
        <Popconfirm title="Delete?" onConfirm={async () => { await api.delete(`/service-partners/${r.id}`); fetchData(); }}><Button icon={<DeleteOutlined />} size="small" danger /></Popconfirm>
      </Space>
    )},
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0 }}>Service Partners</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); form.resetFields(); setModalOpen(true); }}>Add Partner</Button>
      </div>
      <Table columns={columns} dataSource={data} rowKey="id" loading={loading} />
      <Modal title={editing ? 'Edit Partner' : 'Add Partner'} open={modalOpen} onCancel={() => setModalOpen(false)} onOk={handleSave}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="contact_person" label="Contact Person"><Input /></Form.Item>
          <Form.Item name="email" label="Email"><Input /></Form.Item>
          <Form.Item name="phone" label="Phone"><Input /></Form.Item>
          <Form.Item name="service_type" label="Service Type"><Select showSearch options={serviceTypes} placeholder="Select service type" /></Form.Item>
          <Form.Item name="status" label="Status"><Select options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} /></Form.Item>
        </Form>
      </Modal>
      <Modal title={`Attachments — ${attachModal?.name || ''}`} open={!!attachModal} onCancel={() => setAttachModal(null)} footer={null}>
        <EntityAttachments entityType="service-partners" entityId={attachModal?.id} />
      </Modal>
    </div>
  );
}
