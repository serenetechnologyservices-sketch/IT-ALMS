import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Space, Modal, Input, message } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import api from '../api/axios';

const STATUS_COLOR = { pending_manager: 'orange', pending_admin: 'blue', approved: 'green', rejected: 'red' };

export default function Approvals() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState('');
  const [actionModal, setActionModal] = useState(null); // { record, action }

  const fetchData = async () => {
    setLoading(true);
    try { const res = await api.get('/requests'); setData(res.data.data); } catch { message.error('Failed'); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openAction = (record, action) => {
    setActionModal({ record, action });
    setComments('');
  };

  const handleSubmit = async () => {
    if (!actionModal) return;
    try {
      await api.put(`/approvals/${actionModal.record.id}`, { action: actionModal.action, comments });
      message.success(`Request ${actionModal.action}`);
      setActionModal(null); setComments(''); fetchData();
    } catch (err) { message.error(err.response?.data?.error || 'Error'); }
  };

  const isApprove = actionModal?.action === 'approved';

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: 'Requester', dataIndex: ['requester', 'full_name'], key: 'req' },
    { title: 'Department', dataIndex: ['requester', 'department'], key: 'dept' },
    { title: 'Type', dataIndex: 'request_type', key: 'type', render: v => <Tag>{v?.replace('_', ' ').toUpperCase()}</Tag> },
    { title: 'Item', dataIndex: ['catalogItem', 'name'], key: 'item' },
    { title: 'Justification', dataIndex: 'justification', key: 'just', ellipsis: true },
    { title: 'Status', dataIndex: 'status', key: 'status', render: s => <Tag color={STATUS_COLOR[s]}>{s?.replace('_', ' ').toUpperCase()}</Tag> },
    { title: 'Actions', key: 'actions', width: 180, fixed: 'right', render: (_, r) => (r.status === 'pending_manager' || r.status === 'pending_admin') ? (
      <Space size={4} wrap>
        <Button type="primary" size="small" icon={<CheckOutlined />} onClick={() => openAction(r, 'approved')}>Approve</Button>
        <Button danger size="small" icon={<CloseOutlined />} onClick={() => openAction(r, 'rejected')}>Reject</Button>
      </Space>
    ) : '-' },
  ];

  return (
    <div>
      <h2>Approvals</h2>
      <Table columns={columns} dataSource={data} rowKey="id" loading={loading} scroll={{ x: 1000 }} />
      <Modal
        title={isApprove ? 'Approve Request' : 'Reject Request'}
        open={!!actionModal}
        onCancel={() => setActionModal(null)}
        footer={[
          <Button key="cancel" onClick={() => setActionModal(null)}>Cancel</Button>,
          <Button key="submit" type="primary" danger={!isApprove} onClick={handleSubmit}>
            Submit
          </Button>,
        ]}
      >
        <p>Request #{actionModal?.record?.id} from {actionModal?.record?.requester?.full_name}</p>
        <p><strong>Request Justification:</strong> {actionModal?.record?.justification}</p>
        <Input.TextArea
          rows={3}
          placeholder={isApprove ? 'Justification for approval...' : 'Reason for rejection...'}
          value={comments}
          onChange={e => setComments(e.target.value)}
        />
      </Modal>
    </div>
  );
}
