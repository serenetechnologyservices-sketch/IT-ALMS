import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Tag, Button, Modal, Form, Input, Badge, Spin, message } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import api from '../api/axios';

const STOCK_COLOR = { available: 'green', limited: 'orange', out_of_stock: 'red' };

export default function Marketplace() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    api.get('/catalog').then(r => { setItems(r.data.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleRequest = async () => {
    try {
      const values = await form.validateFields();
      await api.post('/requests', { catalog_id: selected.id, request_type: 'new_asset', justification: values.justification });
      message.success('Request submitted for approval'); setModalOpen(false);
    } catch (err) { message.error(err.response?.data?.error || 'Error'); }
  };

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;

  return (
    <div>
      <h2>Asset Marketplace</h2>
      <Row gutter={[16, 16]}>
        {items.map(item => (
          <Col xs={24} sm={12} md={8} lg={6} key={item.id}>
            <Badge.Ribbon text={item.stock_status?.replace('_', ' ').toUpperCase()} color={STOCK_COLOR[item.stock_status]}>
              <Card hoverable title={item.name} extra={<Tag>{item.category?.name}</Tag>}
                actions={[
                  <Button type="link" icon={<ShoppingCartOutlined />} disabled={item.stock_status === 'out_of_stock'}
                    onClick={() => { setSelected(item); form.resetFields(); setModalOpen(true); }}>Request</Button>
                ]}>
                <p>{item.description || 'No description'}</p>
                <p style={{ color: '#999', fontSize: 12 }}>Available: {item.inventory?.available || 0}</p>
              </Card>
            </Badge.Ribbon>
          </Col>
        ))}
      </Row>
      <Modal title={`Request: ${selected?.name}`} open={modalOpen} onCancel={() => setModalOpen(false)} onOk={handleRequest}>
        <Form form={form} layout="vertical">
          <Form.Item name="justification" label="Justification" rules={[{ required: true, message: 'Please provide justification' }]}>
            <Input.TextArea rows={4} placeholder="Why do you need this asset?" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
