import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, Popconfirm, Tag, Space, Tabs, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../api/axios';

const TYPE_LABELS = {
  department: 'Departments',
  issue_type: 'Issue Types',
  location: 'Locations',
  service_type: 'Service Types',
  specialization: 'Specializations',
  vendor_service_type: 'Vendor Service Types',
};

export default function SubMasters() {
  const [data, setData] = useState([]);
  const [types, setTypes] = useState([]);
  const [activeType, setActiveType] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const fetchTypes = async () => {
    try {
      const res = await api.get('/sub-masters/types');
      const t = res.data.data || [];
      setTypes(t);
      if (t.length > 0 && !activeType) { setActiveType(t[0]); fetchData(t[0]); }
    } catch {}
  };

  const fetchData = async (type) => {
    if (!type) return;
    setLoading(true);
    try {
      const res = await api.get(`/sub-masters/type/${type}`);
      setData(res.data.data || []);
    } catch { message.error('Failed to load'); }
    setLoading(false);
  };

  useEffect(() => { fetchTypes(); }, []);

  const handleTabChange = (type) => { setActiveType(type); fetchData(type); };

  const openAdd = () => { setEditing(null); form.resetFields(); form.setFieldsValue({ type: activeType }); setModalOpen(true); };
  const openEdit = (r) => { setEditing(r); form.setFieldsValue(r); setModalOpen(true); };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editing) { await api.put(`/sub-masters/${editing.id}`, values); message.success('Updated'); }
      else { await api.post('/sub-masters', values); message.success('Created'); }
      setModalOpen(false); fetchData(activeType);
    } catch (err) { message.error(err.response?.data?.error || 'Error'); }
  };

  const handleDelete = async (id) => {
    try { await api.delete(`/sub-masters/${id}`); message.success('Deleted'); fetchData(activeType); }
    catch { message.error('Failed'); }
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Description', dataIndex: 'description', key: 'desc', render: v => v || '-' },
    { title: 'Sort Order', dataIndex: 'sort_order', key: 'sort', width: 100 },
    { title: 'Status', dataIndex: 'status', key: 'status', width: 100, render: s => <Tag color={s === 'active' ? 'green' : 'red'}>{s?.toUpperCase()}</Tag> },
    { title: 'Actions', key: 'actions', width: 150, render: (_, r) => (
      <Space>
        <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(r)} />
        <Popconfirm title="Delete?" onConfirm={() => handleDelete(r.id)}><Button icon={<DeleteOutlined />} size="small" danger /></Popconfirm>
      </Space>
    )},
  ];

  const tabItems = types.map(t => ({ key: t, label: TYPE_LABELS[t] || t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) }));

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0 }}>Sub Masters</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>Add Entry</Button>
      </div>
      <Tabs items={tabItems} activeKey={activeType} onChange={handleTabChange} />
      <Table columns={columns} dataSource={data} rowKey="id" loading={loading} pagination={false} size="small" />
      <Modal title={editing ? 'Edit Entry' : 'Add Entry'} open={modalOpen} onCancel={() => setModalOpen(false)} onOk={handleSave}>
        <Form form={form} layout="vertical">
          <Form.Item name="type" label="Type" rules={[{ required: true }]}>
            <Select options={[...types.map(t => ({ value: t, label: TYPE_LABELS[t] || t })), { value: '__new__', label: '+ New Type...' }]}
              onChange={v => { if (v === '__new__') { form.setFieldsValue({ type: '' }); } }} />
          </Form.Item>
          {form.getFieldValue('type') === '' && (
            <Form.Item name="type" label="New Type Name" rules={[{ required: true }]}><Input placeholder="e.g. priority_level" /></Form.Item>
          )}
          <Form.Item name="name" label="Name" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="description" label="Description"><Input /></Form.Item>
          <Form.Item name="sort_order" label="Sort Order"><InputNumber style={{ width: '100%' }} min={0} /></Form.Item>
          <Form.Item name="status" label="Status" initialValue="active">
            <Select options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
