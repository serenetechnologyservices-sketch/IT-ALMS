import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Spin, Table, Tag, List, Badge, Divider, Typography } from 'antd';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const { Title, Text } = Typography;
const PIE_COLORS = ['#52c41a', '#faad14', '#ff4d4f', '#1890ff', '#722ed1', '#eb2f96'];
const STATUS_COLOR = { available: '#52c41a', allocated: '#1890ff', repair: '#faad14', scrap: '#ff4d4f' };
const PRIORITY_COLOR = { low: '#52c41a', medium: '#1890ff', high: '#faad14', critical: '#ff4d4f' };
const TICKET_STATUS_COLOR = { open: '#1890ff', assigned: '#13c2c2', in_progress: '#faad14', waiting: '#722ed1', resolved: '#52c41a', closed: '#999' };

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('asset_user') || '{}');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/dashboard').then(r => { setData(r.data.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />;
  if (!data) return <div>No dashboard data available</div>;

  // ─── ADMIN DASHBOARD ───
  if (user.role === 'Admin') {
    const inv = data.inventory || {};
    return (
      <div>
        <Title level={3}>Admin Dashboard</Title>

        {/* Inventory Stats */}
        <Row gutter={[16, 16]}>
          {[
            { title: 'Total Assets', value: inv.total, color: '#1890ff' },
            { title: 'Available', value: inv.available, color: '#52c41a' },
            { title: 'Allocated', value: inv.allocated, color: '#faad14' },
            { title: 'In Repair', value: inv.repair, color: '#ff4d4f' },
            { title: 'Scrapped', value: inv.scrap, color: '#999' },
            { title: 'Total Users', value: data.total_users, color: '#722ed1' },
          ].map(item => (
            <Col xs={12} sm={8} md={4} key={item.title}>
              <Card hoverable><Statistic title={item.title} value={item.value ?? 0} valueStyle={{ color: item.color }} /></Card>
            </Col>
          ))}
        </Row>

        {/* Approvals Stats */}
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          {[
            { title: 'Pending (Manager)', value: data.approvals?.pending_manager, color: '#fa8c16' },
            { title: 'Pending (Admin)', value: data.approvals?.pending_admin, color: '#1890ff' },
            { title: 'Approved', value: data.approvals?.approved, color: '#52c41a' },
            { title: 'Rejected', value: data.approvals?.rejected, color: '#ff4d4f' },
          ].map(item => (
            <Col xs={12} sm={6} key={item.title}>
              <Card hoverable><Statistic title={item.title} value={item.value ?? 0} valueStyle={{ color: item.color }} /></Card>
            </Col>
          ))}
        </Row>

        <Divider />

        {/* Charts Row */}
        <Row gutter={[16, 16]}>
          {/* Assets by Category */}
          <Col xs={24} md={12}>
            <Card title="Assets by Category">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data.assets_by_category || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#1890ff" name="Assets" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          {/* Tickets by Status */}
          <Col xs={24} md={12}>
            <Card title="Tickets by Status">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={data.tickets?.by_status || []} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={100}
                    label={({ status, count }) => `${status}: ${count}`}>
                    {(data.tickets?.by_status || []).map((e, i) => (
                      <Cell key={i} fill={TICKET_STATUS_COLOR[e.status] || PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip /><Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          {/* Tickets by Priority */}
          <Col xs={24} md={12}>
            <Card title="Tickets by Priority">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data.tickets?.by_priority || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="priority" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" name="Tickets">
                    {(data.tickets?.by_priority || []).map((e, i) => (
                      <Cell key={i} fill={PRIORITY_COLOR[e.priority] || PIE_COLORS[i]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          {/* Expiring Contracts */}
          <Col xs={24} md={12}>
            <Card title={<>Expiring Contracts <Badge count={data.expiring_contracts?.length || 0} style={{ marginLeft: 8 }} /></>}>
              {data.expiring_contracts?.length > 0 ? (
                <List size="small" dataSource={data.expiring_contracts} renderItem={c => (
                  <List.Item>
                    <Text strong>{c.vendor?.name}</Text> — <Tag color="red">{c.contract_type?.toUpperCase()}</Tag> expires {c.end_date}
                  </List.Item>
                )} />
              ) : <Text type="secondary">No contracts expiring soon</Text>}
            </Card>
          </Col>
        </Row>

        {/* Recent Tickets */}
        <Card title="Recent Tickets" style={{ marginTop: 16 }}>
          <Table size="small" pagination={false} dataSource={data.tickets?.recent || []} rowKey="id" columns={[
            { title: 'ID', dataIndex: 'id', width: 60 },
            { title: 'Asset', dataIndex: ['asset', 'name'] },
            { title: 'Created By', dataIndex: ['creator', 'full_name'] },
            { title: 'Priority', dataIndex: 'priority', render: p => <Tag color={PRIORITY_COLOR[p]}>{p?.toUpperCase()}</Tag> },
            { title: 'Status', dataIndex: 'status', render: s => <Tag color={TICKET_STATUS_COLOR[s]}>{s?.replace('_', ' ').toUpperCase()}</Tag> },
          ]} />
        </Card>
      </div>
    );
  }

  // ─── CIO DASHBOARD ───
  if (user.role === 'CIO') {
    return (
      <div>
        <Title level={3}>CIO Dashboard</Title>

        <Row gutter={[16, 16]}>
          <Col xs={12} md={6}><Card hoverable><Statistic title="Total Assets" value={data.total_assets} valueStyle={{ color: '#1890ff' }} /></Card></Col>
          <Col xs={12} md={6}><Card hoverable><Statistic title="Purchase Cost" value={`₹${(data.total_purchase_cost || 0).toLocaleString()}`} /></Card></Col>
          <Col xs={12} md={6}><Card hoverable><Statistic title="Current Value" value={`₹${(data.total_current_value || 0).toLocaleString()}`} valueStyle={{ color: '#52c41a' }} /></Card></Col>
          <Col xs={12} md={6}><Card hoverable><Statistic title="Maintenance Cost" value={`₹${(data.total_maintenance_cost || 0).toLocaleString()}`} valueStyle={{ color: '#ff4d4f' }} /></Card></Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={12} md={12}>
            <Card><Statistic title="Total Depreciation" value={`₹${(data.total_depreciation || 0).toLocaleString()}`} valueStyle={{ color: '#fa8c16' }} /></Card>
          </Col>
          <Col xs={12} md={12}>
            <Card><Statistic title="Depreciation %" value={data.total_purchase_cost > 0 ? `${Math.round((data.total_depreciation / data.total_purchase_cost) * 100)}%` : '0%'} valueStyle={{ color: '#722ed1' }} /></Card>
          </Col>
        </Row>

        <Divider />

        <Row gutter={[16, 16]}>
          {/* Health Distribution Pie */}
          <Col xs={24} md={12}>
            <Card title="Asset Health Distribution">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={data.health_distribution || []} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                    {(data.health_distribution || []).map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                  </Pie>
                  <Tooltip /><Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          {/* Status Distribution Pie */}
          <Col xs={24} md={12}>
            <Card title="Asset Status Distribution">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={data.status_distribution || []} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                    {(data.status_distribution || []).map((e, i) => <Cell key={i} fill={STATUS_COLOR[e.name?.toLowerCase()] || PIE_COLORS[i]} />)}
                  </Pie>
                  <Tooltip /><Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          {/* Cost by Category Bar */}
          <Col xs={24} md={12}>
            <Card title="Cost by Category (Purchase vs Current)">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.cost_by_category || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="purchase" fill="#1890ff" name="Purchase Cost" />
                  <Bar dataKey="current" fill="#52c41a" name="Current Value" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          {/* Depreciation Trend Line */}
          <Col xs={24} md={12}>
            <Card title="Asset Value Trend (12 Months)">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.depreciation_trend || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis />
                  <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
                  <Line type="monotone" dataKey="value" stroke="#1890ff" name="Total Value" dot={false} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }

  // ─── EMPLOYEE DASHBOARD ───
  if (user.role === 'Employee') {
    const reqStatus = data.requests?.by_status || {};
    const reqPieData = Object.entries(reqStatus).map(([status, count]) => ({ name: status.replace('_', ' '), value: count }));
    const tktStatus = data.tickets?.by_status || {};
    const tktPieData = Object.entries(tktStatus).map(([status, count]) => ({ name: status.replace('_', ' '), value: count }));

    return (
      <div>
        <Title level={3}>My Dashboard</Title>

        <Row gutter={[16, 16]}>
          <Col xs={8}><Card hoverable onClick={() => navigate('/assets')}><Statistic title="My Assets" value={data.my_asset_count || 0} valueStyle={{ color: '#1890ff' }} /></Card></Col>
          <Col xs={8}><Card hoverable onClick={() => navigate('/requests')}><Statistic title="My Requests" value={data.requests?.total || 0} valueStyle={{ color: '#722ed1' }} /></Card></Col>
          <Col xs={8}><Card hoverable onClick={() => navigate('/tickets')}><Statistic title="Open Issues" value={data.tickets?.total || 0} valueStyle={{ color: '#ff4d4f' }} /></Card></Col>
        </Row>

        <Divider />

        <Row gutter={[16, 16]}>
          {/* My Assets Table */}
          <Col xs={24} md={14}>
            <Card title="My Assigned Assets">
              <Table size="small" pagination={false} dataSource={data.my_assets || []} rowKey="id" columns={[
                { title: 'Asset', dataIndex: ['asset', 'name'] },
                { title: 'Category', dataIndex: ['asset', 'category', 'name'] },
                { title: 'Serial No.', dataIndex: ['asset', 'serial_number'] },
                { title: 'Status', dataIndex: ['asset', 'status'], render: s => <Tag color={STATUS_COLOR[s]}>{s?.toUpperCase()}</Tag> },
                { title: 'Location', dataIndex: 'location' },
              ]} />
            </Card>
          </Col>

          {/* Request Status Pie */}
          <Col xs={24} md={10}>
            <Card title="Request Status">
              {reqPieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={reqPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {reqPieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip /><Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : <Text type="secondary">No requests yet</Text>}
            </Card>
          </Col>
        </Row>

        {/* Recent Tickets */}
        {data.tickets?.recent?.length > 0 && (
          <Card title="My Open Issues" style={{ marginTop: 16 }}>
            <Table size="small" pagination={false} dataSource={data.tickets.recent} rowKey="id" columns={[
              { title: 'ID', dataIndex: 'id', width: 60 },
              { title: 'Asset', dataIndex: ['asset', 'name'] },
              { title: 'Issue', dataIndex: 'issue_type' },
              { title: 'Priority', dataIndex: 'priority', render: p => <Tag color={PRIORITY_COLOR[p]}>{p?.toUpperCase()}</Tag> },
              { title: 'Status', dataIndex: 'status', render: s => <Tag color={TICKET_STATUS_COLOR[s]}>{s?.replace('_', ' ').toUpperCase()}</Tag> },
            ]} />
          </Card>
        )}
      </div>
    );
  }

  // ─── REPORTING MANAGER DASHBOARD ───
  if (user.role === 'Reporting Manager') {
    return (
      <div>
        <Title level={3}>Manager Dashboard</Title>

        <Row gutter={[16, 16]}>
          <Col xs={8}><Card hoverable><Statistic title="Team Size" value={data.team_size || 0} valueStyle={{ color: '#1890ff' }} /></Card></Col>
          <Col xs={8}><Card hoverable><Statistic title="Team Assets" value={data.team_asset_count || 0} valueStyle={{ color: '#52c41a' }} /></Card></Col>
          <Col xs={8}><Card hoverable onClick={() => navigate('/approvals')}><Statistic title="Pending Approvals" value={data.pending_approvals?.total || 0} valueStyle={{ color: '#fa8c16' }} /></Card></Col>
        </Row>

        <Divider />

        <Row gutter={[16, 16]}>
          {/* Assets per Team Member */}
          <Col xs={24} md={12}>
            <Card title="Assets per Team Member">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data.assets_per_member || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#1890ff" name="Assets" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          {/* Team Tickets by Priority */}
          <Col xs={24} md={12}>
            <Card title={`Team Tickets (${data.team_tickets?.total || 0} open)`}>
              {Object.keys(data.team_tickets?.by_priority || {}).length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={Object.entries(data.team_tickets.by_priority).map(([p, c]) => ({ name: p, value: c }))}
                      dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                      {Object.keys(data.team_tickets.by_priority).map((p, i) => <Cell key={i} fill={PRIORITY_COLOR[p] || PIE_COLORS[i]} />)}
                    </Pie>
                    <Tooltip /><Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : <Text type="secondary">No open tickets</Text>}
            </Card>
          </Col>
        </Row>

        {/* Pending Approvals List */}
        {data.pending_approvals?.items?.length > 0 && (
          <Card title="Pending Approval Requests" style={{ marginTop: 16 }}>
            <Table size="small" pagination={false} dataSource={data.pending_approvals.items} rowKey="id" columns={[
              { title: 'ID', dataIndex: 'id', width: 60 },
              { title: 'Requester', dataIndex: ['requester', 'full_name'] },
              { title: 'Item', dataIndex: ['catalogItem', 'name'], render: v => v || 'Return Request' },
              { title: 'Justification', dataIndex: 'justification', ellipsis: true },
              { title: 'Status', dataIndex: 'status', render: s => <Tag color="orange">{s?.replace('_', ' ').toUpperCase()}</Tag> },
            ]} />
          </Card>
        )}
      </div>
    );
  }

  // ─── SERVICE PARTNER / ENGINEER DASHBOARD ───
  if (user.role === 'Service Partner' || user.role === 'Service Engineer') {
    return (
      <div>
        <Title level={3}>My Assigned Tickets</Title>

        <Row gutter={[16, 16]}>
          <Col xs={8}><Card hoverable><Statistic title="Active Tickets" value={data.total_active || 0} valueStyle={{ color: '#1890ff' }} /></Card></Col>
        </Row>

        <Divider />

        <Row gutter={[16, 16]}>
          {/* By Status */}
          <Col xs={24} md={12}>
            <Card title="Tickets by Status">
              {(data.by_status || []).length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={data.by_status} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={100} label>
                      {(data.by_status || []).map((e, i) => <Cell key={i} fill={TICKET_STATUS_COLOR[e.status] || PIE_COLORS[i]} />)}
                    </Pie>
                    <Tooltip /><Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : <Text type="secondary">No tickets</Text>}
            </Card>
          </Col>

          {/* By Priority */}
          <Col xs={24} md={12}>
            <Card title="Tickets by Priority">
              {(data.by_priority || []).length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={data.by_priority}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="priority" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" name="Tickets">
                      {(data.by_priority || []).map((e, i) => <Cell key={i} fill={PRIORITY_COLOR[e.priority] || PIE_COLORS[i]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : <Text type="secondary">No tickets</Text>}
            </Card>
          </Col>
        </Row>

        {/* Ticket List */}
        <Card title="Ticket Details" style={{ marginTop: 16 }}>
          <Table size="small" dataSource={data.assigned_tickets || []} rowKey="id" columns={[
            { title: 'ID', dataIndex: 'id', width: 60 },
            { title: 'Asset', dataIndex: ['asset', 'name'] },
            { title: 'Serial No.', dataIndex: ['asset', 'serial_number'] },
            { title: 'Created By', dataIndex: ['creator', 'full_name'] },
            { title: 'Issue', dataIndex: 'issue_type' },
            { title: 'Priority', dataIndex: 'priority', render: p => <Tag color={PRIORITY_COLOR[p]}>{p?.toUpperCase()}</Tag> },
            { title: 'Status', dataIndex: 'status', render: s => <Tag color={TICKET_STATUS_COLOR[s]}>{s?.replace('_', ' ').toUpperCase()}</Tag> },
          ]} />
        </Card>
      </div>
    );
  }

  // ─── FALLBACK ───
  return <div><Title level={3}>Dashboard</Title><Text>Welcome to Asset Intelligence & Control Platform</Text></div>;
}
