import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Alert, Divider } from 'antd';
import { UserOutlined, LockOutlined, DesktopOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Title, Text } = Typography;

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (values) => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', values);
      localStorage.setItem('asset_token', res.data.token);
      localStorage.setItem('asset_user', JSON.stringify(res.data.user));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #001529 0%, #003a70 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <DesktopOutlined style={{ fontSize: 48, color: '#1890ff' }} />
          <Title level={2} style={{ color: '#fff', margin: '12px 0 4px' }}>Asset Platform</Title>
          <Text style={{ color: 'rgba(255,255,255,0.65)' }}>Asset Intelligence & Control Platform</Text>
        </div>

        <Card style={{ borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
          <Title level={4} style={{ textAlign: 'center', marginBottom: 24 }}>Sign In</Title>
          {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}
          <Form layout="vertical" onFinish={handleLogin} autoComplete="off">
            <Form.Item name="username" rules={[{ required: true, message: 'Enter your username' }]}>
              <Input prefix={<UserOutlined style={{ color: '#bfbfbf' }} />} placeholder="Username" size="large" />
            </Form.Item>
            <Form.Item name="password" rules={[{ required: true, message: 'Enter your password' }]}>
              <Input.Password prefix={<LockOutlined style={{ color: '#bfbfbf' }} />} placeholder="Password" size="large" />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0 }}>
              <Button type="primary" htmlType="submit" size="large" loading={loading} block>Sign In</Button>
            </Form.Item>
          </Form>

          <Divider style={{ margin: '20px 0 16px' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>Demo Credentials</Text>
          </Divider>
          <div style={{ background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 8, padding: '12px 16px', maxHeight: 320, overflowY: 'auto' }}>
            {[
              { role: 'Admin (IT)', username: 'admin', password: 'admin123', color: '#389e0d' },
              { role: 'Reporting Manager', username: 'manager1', password: 'password123', color: '#1890ff' },
              { role: 'Employee', username: 'employee1', password: 'password123', color: '#096dd9' },
              { role: 'CIO', username: 'cio', password: 'password123', color: '#722ed1' },
              { role: 'Service Partner', username: 'partner1', password: 'password123', color: '#fa8c16' },
              { role: 'Service Engineer', username: 'engineer1', password: 'password123', color: '#eb2f96' },
            ].map((cred, i) => (
              <div key={cred.role}>
                {i > 0 && <Divider style={{ margin: '8px 0' }} />}
                <div style={{ marginBottom: 4 }}>
                  <Text strong style={{ color: cred.color, fontSize: 13 }}>{cred.role}</Text>
                </div>
                <div style={{ display: 'flex', gap: 24 }}>
                  <div><Text type="secondary" style={{ fontSize: 11 }}>Username</Text><br /><Text strong copyable style={{ fontSize: 13 }}>{cred.username}</Text></div>
                  <div><Text type="secondary" style={{ fontSize: 11 }}>Password</Text><br /><Text strong copyable style={{ fontSize: 13 }}>{cred.password}</Text></div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
