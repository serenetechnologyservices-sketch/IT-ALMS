import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, Popconfirm, Tag, Space, Tooltip, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, PaperClipOutlined } from '@ant-design/icons';
import api from '../api/axios';
import EntityAttachments from '../components/EntityAttachments';

export default function CatalogManage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [attachModal, setAttachModal] = useState(null);
  const [categories, setCategories] = useState([]);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try { const res = await api.get('/catalog'); setData(res.data.data); } catch { message.error('Failed to load'); }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    api.get('/assets/categories').then(r => setCategories(r.data.data || [])).catch(() => {});
  }, []);

  const openAdd = () => { setEditing(null); form.resetFields(); setModalOpen(true); };
  const openEdit = (r) => { setEditing(r); form.setFieldsValue({ ...r, available: r.inventory?.available, allocated: r.inventory?.allocated, reserved: r.inventory?.reserved, scrap: r.inventory?.scrap }); setModalOpen(true); };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editing) { await api.put(`/catalog/${editing.id}`, values); message.success('Updated'); }
      else { await api.post('/catalog', values); message.success('Created'); }
      setModalOpen(false); fetchData();
    } catch (err) { message.error(err.response?.data?.error || 'Error'); }
  };

  const handleDelete = async (id) => {
    try { await api.delete(`/catalog/${id}`); message.success('Deleted'); fetchData(); } catch { message.error('Failed'); }
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Category', dataIndex: ['category', 'name'], key: 'cat' },
    { title: 'Available', dataIndex: ['inventory', 'available'], key: 'avail' },
    { title: 'Allocated', dataIndex: ['inventory', 'allocated'], key: 'alloc' },
    { title: 'Reserved', dataIndex: ['inventory', 'reserved'], key: 'res' },
    { title: 'Stock', dataIndex: 'stock_status', key: 'stock', render: s => <Tag color={s === 'available' ? 'green' : s === 'limited' ? 'orange' : 'red'}>{s?.replace('_', ' ').toUpperCase()}</Tag> },
    { title: 'Actions', key: 'actions', render: (_, r) => (
      <Space>
        <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(r)} />
        <Tooltip title="Photos & Attachments"><Button icon={<PaperClipOutlined />} size="small" onClick={() => setAttachModal(r)} /></Tooltip>
        <Popconfirm title="Delete?" onConfirm={() => handleDelete(r.id)}><Button icon={<DeleteOutlined />} size="small" danger /></Popconfirm>
      </Space>
    )},
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0 }}>Catalog Management</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>Add Item</Button>
      </div>
      <Table columns={columns} dataSource={data} rowKey="id" loading={loading} />
      <Modal title={editing ? 'Edit Item' : 'Add Item'} open={modalOpen} onCancel={() => setModalOpen(false)} onOk={handleSave}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="description" label="Description"><Input.TextArea rows={2} /></Form.Item>
          <Form.Item name="category_id" label="Category"><Select options={categories.map(c => ({ value: c.id, label: c.name }))} /></Form.Item>
          <Form.Item name="available" label="Available Stock"><InputNumber style={{ width: '100%' }} min={0} /></Form.Item>
        </Form>
      </Modal>
      <Modal title={`Photos & Attachments — ${attachModal?.name || ''}`} open={!!attachModal} onCancel={() => setAttachModal(null)} footer={null}>
        <EntityAttachments entityType="catalog" entityId={attachModal?.id} />
      </Modal>
    </div>
  );
}
