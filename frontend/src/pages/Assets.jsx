import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, InputNumber, Popconfirm, Tag, Space, Typography, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, CopyOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const STATUS_COLOR = { available: 'green', allocated: 'blue', repair: 'orange', scrap: 'red' };

export default function Assets() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('asset_user') || '{}');
  const isAdmin = user.role === 'Admin';

  const fetchData = async (page = 1, pageSize = 20) => {
    setLoading(true);
    try {
      const res = await api.get('/assets', { params: { page, limit: pageSize } });
      setData(res.data.data); setPagination({ current: page, pageSize, total: res.data.pagination.total });
    } catch { message.error('Failed to load assets'); }
    setLoading(false);
  };

  const fetchDropdowns = async () => {
    try {
      const [cRes, vRes] = await Promise.all([api.get('/assets/categories'), api.get('/vendors?limit=200')]);
      setCategories(cRes.data.data || []); setVendors(vRes.data.data || []);
    } catch {}
  };

  useEffect(() => { fetchData(); fetchDropdowns(); }, []);

  const openAdd = () => { setEditing(null); form.resetFields(); setModalOpen(true); };
  const openEdit = (r) => { setEditing(r); form.setFieldsValue(r); setModalOpen(true); };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editing) { await api.put(`/assets/${editing.id}`, values); message.success('Asset updated'); }
      else {
        const res = await api.post('/assets', values);
        const agentId = res.data.data.agent_id;
        Modal.success({
          title: 'Asset Created',
          content: (
            <div>
              <p>Asset created successfully.</p>
              <p style={{ marginTop: 8 }}>Use this Agent ID when installing the device agent:</p>
              <div style={{ background: '#f5f5f5', padding: '8px 12px', borderRadius: 4, fontFamily: 'monospace', fontSize: 16, fontWeight: 600 }}>
                {agentId}
              </div>
              <p style={{ color: '#999', fontSize: 12, marginTop: 8 }}>Copy this ID and paste it in the agent config.yaml file as agent_id</p>
            </div>
          ),
        });
      }
      setModalOpen(false); fetchData(pagination.current, pagination.pageSize);
    } catch (err) { message.error(err.response?.data?.error || 'Error saving'); }
  };

  const handleDelete = async (id) => {
    try { await api.delete(`/assets/${id}`); message.success('Deleted'); fetchData(pagination.current, pagination.pageSize); }
    catch { message.error('Failed to delete'); }
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Category', dataIndex: ['category', 'name'], key: 'category' },
    { title: 'Serial No.', dataIndex: 'serial_number', key: 'serial_number' },
    { title: 'Agent ID', dataIndex: 'agent_id', key: 'agent_id', width: 130, render: v => v ? (
      <Typography.Text copyable={{ text: v }} style={{ fontSize: 12 }}>{v}</Typography.Text>
    ) : '-' },
    { title: 'Vendor', dataIndex: ['vendor', 'name'], key: 'vendor' },
    { title: 'Cost', dataIndex: 'purchase_cost', key: 'cost', render: v => v ? `₹${Number(v).toLocaleString()}` : '-' },
    { title: 'Status', dataIndex: 'status', key: 'status', render: s => <Tag color={STATUS_COLOR[s]}>{s?.toUpperCase()}</Tag> },
    {
      title: 'Actions', key: 'actions', fixed: 'right', width: 150,
      render: (_, r) => (
        <Space>
          <Button icon={<EyeOutlined />} size="small" onClick={() => navigate(`/assets/${r.id}`)} />
          {isAdmin && <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(r)}>Edit</Button>}
          {isAdmin && <Popconfirm title="Delete?" onConfirm={() => handleDelete(r.id)}><Button icon={<DeleteOutlined />} size="small" danger /></Popconfirm>}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0 }}>Assets</h2>
        {isAdmin && <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>Add Asset</Button>}
      </div>
      <Table columns={columns} dataSource={data} rowKey="id" loading={loading} scroll={{ x: 1000 }}
        pagination={{ ...pagination, onChange: (p, ps) => fetchData(p, ps) }} />
      <Modal title={editing ? 'Edit Asset' : 'Add Asset'} open={modalOpen} onCancel={() => setModalOpen(false)}
        onOk={handleSave} width={700}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="category_id" label="Category"><Select options={categories.map(c => ({ value: c.id, label: c.name }))} /></Form.Item>
          <Form.Item name="serial_number" label="Serial Number"><Input /></Form.Item>
          <Form.Item name="configuration" label="Configuration"><Input.TextArea rows={2} /></Form.Item>
          <Form.Item name="purchase_date" label="Purchase Date"><Input type="date" /></Form.Item>
          <Form.Item name="purchase_cost" label="Purchase Cost"><InputNumber style={{ width: '100%' }} min={0} /></Form.Item>
          <Form.Item name="salvage_value" label="Salvage Value"><InputNumber style={{ width: '100%' }} min={0} /></Form.Item>
          <Form.Item name="useful_life_years" label="Useful Life (Years)"><InputNumber style={{ width: '100%' }} min={1} /></Form.Item>
          <Form.Item name="vendor_id" label="Vendor"><Select allowClear options={vendors.map(v => ({ value: v.id, label: v.name }))} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
