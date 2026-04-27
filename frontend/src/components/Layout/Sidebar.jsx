import React from 'react';
import { Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined, DesktopOutlined, SwapOutlined, QrcodeOutlined,
  ShopOutlined, ShoppingCartOutlined, FileTextOutlined, CheckCircleOutlined,
  ToolOutlined, TeamOutlined, UserOutlined, BankOutlined, FileProtectOutlined,
  BellOutlined, BarChartOutlined, DollarOutlined, AlertOutlined, UsergroupAddOutlined,
  MonitorOutlined,
} from '@ant-design/icons';

const MENU_BY_ROLE = {
  Admin: [
    { key: '/', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/assets', icon: <DesktopOutlined />, label: 'Assets' },
    { key: '/allocations', icon: <SwapOutlined />, label: 'Allocations' },
    { key: '/marketplace', icon: <ShoppingCartOutlined />, label: 'Marketplace' },
    { key: '/catalog-manage', icon: <ShopOutlined />, label: 'Catalog Manage' },
    { key: '/requests', icon: <FileTextOutlined />, label: 'Requests' },
    { key: '/approvals', icon: <CheckCircleOutlined />, label: 'Approvals' },
    { key: '/tickets', icon: <ToolOutlined />, label: 'Tickets' },
    { key: '/vendors', icon: <BankOutlined />, label: 'Vendors' },
    { key: '/contracts', icon: <FileProtectOutlined />, label: 'Contracts' },
    { key: '/service-partners', icon: <TeamOutlined />, label: 'Service Partners' },
    { key: '/service-engineers', icon: <UserOutlined />, label: 'Service Engineers' },
    { key: '/users', icon: <UsergroupAddOutlined />, label: 'Users' },
    { key: '/sub-masters', icon: <BarChartOutlined />, label: 'Sub Masters' },
    { key: '/sla', icon: <AlertOutlined />, label: 'SLA Management' },
    { key: '/agent-settings', icon: <DesktopOutlined />, label: 'Agent Settings' },
    { key: '/system-monitor', icon: <MonitorOutlined />, label: 'System Monitor' },
    { key: '/notifications', icon: <BellOutlined />, label: 'Notifications' },
  ],
  Employee: [
    { key: '/', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/marketplace', icon: <ShoppingCartOutlined />, label: 'Marketplace' },
    { key: '/requests', icon: <FileTextOutlined />, label: 'My Requests' },
    { key: '/tickets', icon: <ToolOutlined />, label: 'My Tickets' },
    { key: '/notifications', icon: <BellOutlined />, label: 'Notifications' },
  ],
  'Reporting Manager': [
    { key: '/', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/approvals', icon: <CheckCircleOutlined />, label: 'Approvals' },
    { key: '/assets', icon: <DesktopOutlined />, label: 'Assets' },
    { key: '/tickets', icon: <ToolOutlined />, label: 'Tickets' },
    { key: '/notifications', icon: <BellOutlined />, label: 'Notifications' },
  ],
  CIO: [
    { key: '/', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/assets', icon: <DesktopOutlined />, label: 'Assets' },
    { key: '/sla', icon: <AlertOutlined />, label: 'SLA Management' },
    { key: '/system-monitor', icon: <MonitorOutlined />, label: 'System Monitor' },
    { key: '/notifications', icon: <BellOutlined />, label: 'Notifications' },
  ],
  'Service Partner': [
    { key: '/', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/tickets', icon: <ToolOutlined />, label: 'Assigned Tickets' },
    { key: '/notifications', icon: <BellOutlined />, label: 'Notifications' },
  ],
  'Service Engineer': [
    { key: '/', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/tickets', icon: <ToolOutlined />, label: 'Assigned Tickets' },
    { key: '/notifications', icon: <BellOutlined />, label: 'Notifications' },
  ],
};

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = (() => { try { return JSON.parse(localStorage.getItem('asset_user')) || {}; } catch { return {}; } })();
  const items = MENU_BY_ROLE[user.role] || MENU_BY_ROLE.Employee;

  return (
    <Menu
      theme="dark" mode="inline"
      selectedKeys={[location.pathname]}
      items={items}
      onClick={({ key }) => navigate(key)}
      style={{ height: '100%', borderRight: 0 }}
    />
  );
}
