import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Popconfirm, Tag, Space, Tooltip, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, PaperClipOutlined } from '@ant-design/icons';
import api from '../api/axios';
import EntityAttachments from '../components/EntityAttachments';

const STATUS_COLOR = { active: 'green', inactive: 'red' };

export default function Users() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [roles, setRoles] = useState([]);
  const [managers, setManagers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [attachModal, setAttachModal] = useState(null);
  const [form] = Form.useForm();

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get('/users', { params: { page, limit: 20 } });
      setData(res.data.data);
      setPagination({ current: page, pageSize: 20, total: res.data.pagination.total });
    } catch { message.error('Failed to load users'); }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    // Fetch roles by getting users and extracting unique roles, or hardcode
    setRoles([
      { value: 1, label: 'Employee' },
      { value: 2, label: 'Reporting Manager' },
      { value: 3, label: 'Admin' },
      { value: 4, label: 'CIO' },
      { value: 5, label: 'Service Partner' },
      { value: 6, label: 'Service Engineer' },
    ]);
    api.get('/users?limit=200').then(r => {
      setManagers((r.data.data || []).filter(u => u.role?.name === 'Reporting Manager' || u.role?.name === 'Admin'));
    }).catch(() => {});
    api.get('/sub-masters/type/department').then(r => {
      setDepartments((r.data.data || []).map(d => ({ value: d.name, label: d.name })));
    }).catch(() => {});
  }, []);

  const openAdd = () => { setEditing(null); form.resetFields(); setModalOpen(true); };
  const openEdit = (r) => {
    setEditing(r);
    form.setFieldsValue({ ...r, password: '' });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (!values.password && !editing) {
        return message.error('Password is required for new users');
      }
      // Don't send empty password on edit
      if (editing && !values.password) delete values.password;

      if (editing) {
        await api.put(`/users/${editing.id}`, values);
        message.success('User updated');
      } else {
        await api.post('/users', values);
        message.success('User created');
      }
      setModalOpen(false);
      fetchData(pagination.current);
    } catch (err) { message.error(err.response?.data?.error || 'Error saving user'); }
  };

  const handleDelete = async (id) => {
    try { await api.delete(`/users/${id}`); message.success('User deleted'); fetchData(pagination.current); }
    catch { message.error('Failed to delete'); }
  };

  const columns = [
    { title: 'Username', dataIndex: 'username', key: 'username' },
    { title: 'Full Name', dataIndex: 'full_name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Role', dataIndex: ['role', 'name'], key: 'role', render: v => <Tag color="blue">{v}</Tag> },
    { title: 'Department', dataIndex: 'department', key: 'dept' },
    { title: 'Manager', dataIndex: ['manager', 'full_name'], key: 'mgr', render: v => v || '-' },
    { title: 'Status', dataIndex: 'status', key: 'status', render: s => <Tag color={STATUS_COLOR[s]}>{s?.toUpperCase()}</Tag> },
    {
      title: 'Actions', key: 'actions', width: 150,
      render: (_, r) => (
        <Space>
          <Button icon={<EditOutlined />} size="small" onClick={() => openEdit(r)}>Edit</Button>
          <Tooltip title="Attachments"><Button icon={<PaperClipOutlined />} size="small" onClick={() => setAttachModal(r)} /></Tooltip>
          <Popconfirm title="Delete this user?" onConfirm={() => handleDelete(r.id)}>
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0 }}>User Management</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>Add User</Button>
      </div>
      <Table columns={columns} dataSource={data} rowKey="id" loading={loading} scroll={{ x: 1000 }}
        pagination={{ ...pagination, onChange: p => fetchData(p) }} />
      <Modal title={editing ? 'Edit User' : 'Add User'} open={modalOpen} onCancel={() => setModalOpen(false)} onOk={handleSave} width={600}>
        <Form form={form} layout="vertical">
          <Form.Item name="username" label="Username" rules={[{ required: !editing, message: 'Required' }]}>
            <Input disabled={!!editing} />
          </Form.Item>
          <Form.Item name="password" label={editing ? 'New Password (leave blank to keep)' : 'Password'} rules={editing ? [] : [{ required: true, message: 'Required' }]}>
            <Input.Password placeholder={editing ? 'Leave blank to keep current' : 'Enter password'} />
          </Form.Item>
          <Form.Item name="full_name" label="Full Name" rules={[{ required: true, message: 'Required' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email">
            <Input />
          </Form.Item>
          <Form.Item name="role_id" label="Role" rules={[{ required: true, message: 'Required' }]}>
            <Select options={roles} />
          </Form.Item>
          <Form.Item name="manager_id" label="Reporting Manager">
            <Select allowClear placeholder="Select manager" options={managers.map(m => ({ value: m.id, label: m.full_name }))} />
          </Form.Item>
          <Form.Item name="department" label="Department">
            <Select allowClear showSearch options={departments} placeholder="Select department" />
          </Form.Item>
          {editing && (
            <Form.Item name="status" label="Status">
              <Select options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} />
            </Form.Item>
          )}
        </Form>
      </Modal>
      <Modal title={`Attachments — ${attachModal?.full_name || ''}`} open={!!attachModal} onCancel={() => setAttachModal(null)} footer={null}>
        <EntityAttachments entityType="users" entityId={attachModal?.id} />
      </Modal>
    </div>
  );
}
