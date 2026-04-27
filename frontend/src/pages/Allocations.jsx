import React, { useState, useEffect } from 'react';
import { Table, Button, Drawer, Modal, Form, Select, Input, Tag, Space, Descriptions, Dropdown, Steps, message } from 'antd';
import { PlusOutlined, SwapOutlined, RollbackOutlined, DeleteOutlined, PaperClipOutlined, EyeOutlined, MoreOutlined } from '@ant-design/icons';
import api from '../api/axios';
import EntityAttachments from '../components/EntityAttachments';

const STATUS_COLORS = { active: 'green', returned: 'blue', transferred: 'orange', scrapped: 'red' };
const OPS = {
  allocate: { title: 'Allocate Asset', icon: <PlusOutlined />, color: '#1890ff' },
  transfer: { title: 'Transfer Asset', icon: <SwapOutlined />, color: '#722ed1' },
  return: { title: 'Return Asset', icon: <RollbackOutlined />, color: '#52c41a' },
  scrap: { title: 'Scrap Asset', icon: <DeleteOutlined />, color: '#ff4d4f' },
};

export default function Allocations() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [opType, setOpType] = useState(null);
  const [viewModal, setViewModal] = useState(null);
  const [attachModal, setAttachModal] = useState(null);
  const [assets, setAssets] = useState([]);
  const [allocatedAssets, setAllocatedAssets] = useState([]);
  const [allAssets, setAllAssets] = useState([]);
  const [users, setUsers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [form] = Form.useForm();

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get('/allocations', { params: { page, limit: 20 } });
      setData(res.data.data); setPagination({ current: page, pageSize: 20, total: res.data.pagination.total });
    } catch { message.error('Failed to load'); }
    setLoading(false);
  };

  const loadAssets = () => {
    api.get('/assets?limit=200&status=available').then(r => setAssets(r.data.data || [])).catch(() => {});
    api.get('/assets?limit=200&status=allocated').then(r => setAllocatedAssets(r.data.data || [])).catch(() => {});
    api.get('/assets?limit=200').then(r => setAllAssets((r.data.data || []).filter(a => a.status !== 'scrap'))).catch(() => {});
  };

  useEffect(() => {
    fetchData(); loadAssets();
    api.get('/users?limit=200').then(r => setUsers(r.data.data || [])).catch(() => {});
    api.get('/sub-masters/type/location').then(r => setLocations((r.data.data || []).map(d => ({ value: d.name, label: d.name })))).catch(() => {});
  }, []);

  const openOp = (type) => { setOpType(type); form.resetFields(); setDrawerOpen(true); };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const endpoints = { allocate: '/allocations', transfer: '/allocations/transfer', return: '/allocations/return', scrap: '/allocations/scrap' };
      await api.post(endpoints[opType], values);
      message.success(`${OPS[opType].title} successful`); setDrawerOpen(false); fetchData(); loadAssets();
    } catch (err) { message.error(err.response?.data?.error || 'Error'); }
  };

  const getAssetOptions = () => {
    const list = opType === 'allocate' ? assets : opType === 'scrap' ? allAssets : allocatedAssets;
    return list.map(a => ({ value: a.id, label: `${a.name} (${a.serial_number}) [${a.status}]` }));
  };

  const rowActions = (r) => ({
    items: [
      { key: 'view', icon: <EyeOutlined />, label: 'View Details' },
      { key: 'attach', icon: <PaperClipOutlined />, label: 'Attachments' },
    ],
    onClick: ({ key }) => {
      if (key === 'view') setViewModal(r);
      else if (key === 'attach') setAttachModal(r);
    },
  });

  const columns = [
    { title: 'Asset', dataIndex: ['asset', 'name'], key: 'asset' },
    { title: 'Serial No.', dataIndex: ['asset', 'serial_number'], key: 'serial' },
    { title: 'Assigned To', dataIndex: ['user', 'full_name'], key: 'user' },
    { title: 'Location', dataIndex: 'location', key: 'location' },
    { title: 'Date', dataIndex: 'allocation_date', key: 'date' },
    { title: 'Status', dataIndex: 'status', key: 'status', width: 110, render: s => <Tag color={STATUS_COLORS[s] || 'default'}>{s?.toUpperCase()}</Tag> },
    { title: '', key: 'actions', width: 50, render: (_, r) => (
      <Dropdown menu={rowActions(r)} trigger={['click']}><Button icon={<MoreOutlined />} type="text" size="small" /></Dropdown>
    )},
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Allocations</h2>
        <Space>
          {Object.entries(OPS).map(([key, cfg]) => (
            <Button key={key} icon={cfg.icon} type={key === 'allocate' ? 'primary' : 'default'}
              danger={key === 'scrap'} onClick={() => openOp(key)}>{cfg.title.split(' ')[0]}</Button>
          ))}
        </Space>
      </div>

      <Table columns={columns} dataSource={data} rowKey="id" loading={loading} size="middle"
        pagination={{ ...pagination, onChange: p => fetchData(p), showTotal: t => `${t} records` }} />

      {/* ── Operation Drawer ── */}
      <Drawer title={OPS[opType]?.title || 'Operation'} width={480} open={drawerOpen} onClose={() => setDrawerOpen(false)}
        extra={<Button type="primary" onClick={handleSubmit}>Submit</Button>}>
        <Form form={form} layout="vertical" size="large">
          <Form.Item name="asset_id" label="Asset" rules={[{ required: true }]}>
            <Select showSearch optionFilterProp="label" placeholder="Search and select asset" options={getAssetOptions()} />
          </Form.Item>
          {(opType === 'allocate' || opType === 'transfer') && (
            <>
              <Form.Item name={opType === 'transfer' ? 'new_user_id' : 'user_id'} label={opType === 'transfer' ? 'Transfer To' : 'Allocate To'} rules={[{ required: true }]}>
                <Select showSearch optionFilterProp="label" placeholder="Search user" options={users.map(u => ({ value: u.id, label: `${u.full_name} (${u.username})` }))} />
              </Form.Item>
              <Form.Item name={opType === 'transfer' ? 'new_location' : 'location'} label="Location">
                <Select showSearch options={locations} placeholder="Select location" />
              </Form.Item>
            </>
          )}
          <Form.Item name="remarks" label="Remarks / Reason">
            <Input.TextArea rows={3} placeholder={`Reason for ${opType || 'operation'}...`} />
          </Form.Item>
        </Form>
      </Drawer>

      {/* ── View Details Modal ── */}
      <Modal title={`Allocation #${viewModal?.id || ''}`} open={!!viewModal} onCancel={() => setViewModal(null)} footer={null} width={520}>
        {viewModal && (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Asset">{viewModal.asset?.name}</Descriptions.Item>
            <Descriptions.Item label="Serial No.">{viewModal.asset?.serial_number}</Descriptions.Item>
            <Descriptions.Item label="Assigned To">{viewModal.user?.full_name}</Descriptions.Item>
            <Descriptions.Item label="Allocated By">{viewModal.allocator?.full_name || '-'}</Descriptions.Item>
            <Descriptions.Item label="Location">{viewModal.location || '-'}</Descriptions.Item>
            <Descriptions.Item label="Allocation Date">{viewModal.allocation_date || '-'}</Descriptions.Item>
            <Descriptions.Item label="Return Date">{viewModal.return_date || '-'}</Descriptions.Item>
            <Descriptions.Item label="Status"><Tag color={STATUS_COLORS[viewModal.status] || 'default'}>{viewModal.status?.toUpperCase()}</Tag></Descriptions.Item>
            <Descriptions.Item label="Remarks">{viewModal.remarks || 'No remarks'}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* ── Attachments Modal ── */}
      <Modal title={`Attachments — #${attachModal?.id || ''}`} open={!!attachModal} onCancel={() => setAttachModal(null)} footer={null}>
        <EntityAttachments entityType="allocations" entityId={attachModal?.id} />
      </Modal>
    </div>
  );
}
