import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/Layout/AppLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Assets from './pages/Assets';
import AssetDetail from './pages/AssetDetail';
import Allocations from './pages/Allocations';
import Marketplace from './pages/Marketplace';
import CatalogManage from './pages/CatalogManage';
import Requests from './pages/Requests';
import Approvals from './pages/Approvals';
import Tickets from './pages/Tickets';
import TicketDetail from './pages/TicketDetail';
import Vendors from './pages/Vendors';
import Contracts from './pages/Contracts';
import ServicePartners from './pages/ServicePartners';
import ServiceEngineers from './pages/ServiceEngineers';
import Notifications from './pages/Notifications';
import Users from './pages/Users';
import SubMasters from './pages/SubMasters';
import SlaManagement from './pages/SlaManagement';
import AgentSettings from './pages/AgentSettings';
import SystemMonitor from './pages/SystemMonitor';

function RequireAuth({ children }) {
  const token = localStorage.getItem('asset_token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<RequireAuth><AppLayout /></RequireAuth>}>
          <Route index element={<Dashboard />} />
          <Route path="assets" element={<Assets />} />
          <Route path="assets/:id" element={<AssetDetail />} />
          <Route path="allocations" element={<Allocations />} />
          <Route path="marketplace" element={<Marketplace />} />
          <Route path="catalog-manage" element={<CatalogManage />} />
          <Route path="requests" element={<Requests />} />
          <Route path="approvals" element={<Approvals />} />
          <Route path="tickets" element={<Tickets />} />
          <Route path="tickets/:id" element={<TicketDetail />} />
          <Route path="vendors" element={<Vendors />} />
          <Route path="contracts" element={<Contracts />} />
          <Route path="service-partners" element={<ServicePartners />} />
          <Route path="service-engineers" element={<ServiceEngineers />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="users" element={<Users />} />
          <Route path="sub-masters" element={<SubMasters />} />
          <Route path="sla" element={<SlaManagement />} />
          <Route path="agent-settings" element={<AgentSettings />} />
          <Route path="system-monitor" element={<SystemMonitor />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
