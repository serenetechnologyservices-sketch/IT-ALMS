import React, { useState, useEffect } from 'react';
import { Table, Tag, message } from 'antd';
import api from '../api/axios';

const STATUS_COLOR = { pending_manager: 'orange', pending_admin: 'blue', approved: 'green', rejected: 'red' };

export default function Requests() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get('/requests').then(r => { setData(r.data.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: 'Type', dataIndex: 'request_type', key: 'type', render: v => <Tag>{v?.replace('_', ' ').toUpperCase()}</Tag> },
    { title: 'Catalog Item', dataIndex: ['catalogItem', 'name'], key: 'catalog' },
    { title: 'Justification', dataIndex: 'justification', key: 'just', ellipsis: true },
    { title: 'Status', dataIndex: 'status', key: 'status', render: s => <Tag color={STATUS_COLOR[s]}>{s?.replace('_', ' ').toUpperCase()}</Tag> },
    { title: 'Date', dataIndex: 'created_at', key: 'date', render: v => new Date(v).toLocaleDateString() },
  ];

  return (
    <div>
      <h2>My Requests</h2>
      <Table columns={columns} dataSource={data} rowKey="id" loading={loading} />
    </div>
  );
}
