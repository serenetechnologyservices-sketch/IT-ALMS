import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Popconfirm, Tag, Space, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../api/axios';

export default function ServiceEngineers() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [partners, setPartners] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [form] = Form.useForm();

  const fetchData = async () => { setLoading(true); try { const r = await api.get('/service-engineers'); setData(r.data.data); } catch {} setLoading(false); };
  useEffect(() => {
    fetchData();
    api.get('/service-partners').then(r => setPartners(r.data.data)).catch(() => {});
    api.get('/sub-masters/type/specialization').then(r => setSpecializations((r.data.data || []).map(d => ({ value: d.name, label: d.name })))).catch(() => {});
  }, []);

  const handleSave = async () => {
    try {
      const v = await form.validateFields();
      if (editing) await api.put(`/service-engineers/${editing.id}`, v); else await api.post('/service-engineers', v);
      message.success('Saved'); setModalOpen(false); fetchData();
    } catch (err) { message.error(err.response?.data?.error || 'Error'); }
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Phone', dataIndex: 'phone', key: 'phone' },
    { title: 'Specialization', dataIndex: 'specialization', key: 'spec' },
    { title: 'Partner', dataIndex: ['partner', 'name'], key: 'partner' },
    { title: 'Status', dataIndex: 'status', key: 'status', render: s => <Tag color={s === 'active' ? 'green' : 'red'}>{s?.toUpperCase()}</Tag> },
    { title: 'Actions', key: 'actions', render: (_, r) => (
      <Space>
        <Button icon={<EditOutlined />} size="small" onClick={() => { setEditing(r); form.setFieldsValue(r); setModalOpen(true); }} />
        <Popconfirm title="Delete?" onConfirm={async () => { await api.delete(`/service-engineers/${r.id}`); fetchData(); }}><Button icon={<DeleteOutlined />} size="small" danger /></Popconfirm>
      </Space>
    )},
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0 }}>Service Engineers</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); form.resetFields(); setModalOpen(true); }}>Add Engineer</Button>
      </div>
      <Table columns={columns} dataSource={data} rowKey="id" loading={loading} />
      <Modal title={editing ? 'Edit Engineer' : 'Add Engineer'} open={modalOpen} onCancel={() => setModalOpen(false)} onOk={handleSave}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="email" label="Email"><Input /></Form.Item>
          <Form.Item name="phone" label="Phone"><Input /></Form.Item>
          <Form.Item name="specialization" label="Specialization"><Select showSearch options={specializations} placeholder="Select specialization" /></Form.Item>
          <Form.Item name="partner_id" label="Partner"><Select allowClear options={partners.map(p => ({ value: p.id, label: p.name }))} /></Form.Item>
          <Form.Item name="status" label="Status"><Select options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
