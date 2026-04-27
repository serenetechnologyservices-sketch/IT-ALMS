import React, { useState, useEffect } from 'react';
import { List, Tag, Button, Badge, message } from 'antd';
import { BellOutlined, CheckOutlined } from '@ant-design/icons';
import api from '../api/axios';

const TYPE_COLOR = { maintenance: 'orange', warranty: 'red', approval: 'blue', ticket: 'purple', health: 'volcano' };

export default function Notifications() {
  const [data, setData] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await api.get('/notifications');
      setData(res.data.data); setUnread(res.data.unread_count);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const markRead = async (id) => {
    try { await api.put(`/notifications/${id}/read`); fetchData(); } catch {}
  };

  const markAllRead = async () => {
    try { await api.put('/notifications/read-all'); message.success('All marked as read'); fetchData(); } catch {}
  };

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0 }}>Notifications <Badge count={unread} style={{ marginLeft: 8 }} /></h2>
        <Button icon={<CheckOutlined />} onClick={markAllRead}>Mark All Read</Button>
      </div>
      <List loading={loading} dataSource={data} renderItem={item => (
        <List.Item
          style={{ background: item.is_read ? '#fff' : '#e6f7ff', padding: '12px 16px', marginBottom: 4, borderRadius: 4 }}
          actions={!item.is_read ? [<Button size="small" onClick={() => markRead(item.id)}>Mark Read</Button>] : []}
        >
          <List.Item.Meta
            avatar={<BellOutlined style={{ fontSize: 20, color: item.is_read ? '#999' : '#1890ff' }} />}
            title={<><Tag color={TYPE_COLOR[item.type]}>{item.type?.toUpperCase()}</Tag> {item.title}</>}
            description={<>{item.message} <br /><small style={{ color: '#999' }}>{new Date(item.created_at).toLocaleString()}</small></>}
          />
        </List.Item>
      )} />
    </div>
  );
}
