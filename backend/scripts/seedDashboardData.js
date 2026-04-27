const sequelize = require('../src/config/database');
const { v4: uuidv4 } = require('uuid');

async function seed() {
  const qi = sequelize.getQueryInterface();
  const now = new Date();

  // Helper to get date N days ago
  const daysAgo = (n) => {
    const d = new Date(now);
    d.setDate(d.getDate() - n);
    return d.toISOString().split('T')[0];
  };

  // ── MORE ASSETS (IDs 6-20) ──
  const assets = [];
  const assetNames = [
    { name: 'HP ProBook 450', cat: 1, serial: 'HP-PB450-001', config: 'i5, 8GB RAM, 256GB SSD', cost: 65000, salvage: 8000, vendor: 2 },
    { name: 'Dell OptiPlex 7090', cat: 2, serial: 'DL-7090-001', config: 'i7, 16GB RAM, 512GB SSD', cost: 72000, salvage: 9000, vendor: 1 },
    { name: 'Lenovo ThinkCentre M90', cat: 2, serial: 'LN-M90-001', config: 'i5, 8GB RAM, 256GB SSD', cost: 48000, salvage: 5000, vendor: 3 },
    { name: 'Dell PowerEdge R640', cat: 3, serial: 'DL-R640-001', config: 'Xeon Silver, 32GB, 2TB RAID', cost: 280000, salvage: 40000, vendor: 1 },
    { name: 'HP ProDisplay 27"', cat: 4, serial: 'HP-PD27-001', config: '4K IPS, USB-C', cost: 32000, salvage: 3000, vendor: 2 },
    { name: 'Dell UltraSharp 24"', cat: 4, serial: 'DL-US24-001', config: 'FHD IPS, HDMI', cost: 18000, salvage: 2000, vendor: 1 },
    { name: 'HP Color LaserJet M454', cat: 5, serial: 'HP-CLJ-002', config: 'Color, Network, Duplex', cost: 35000, salvage: 3000, vendor: 2 },
    { name: 'Cisco Catalyst 2960', cat: 6, serial: 'CS-2960-001', config: '24-port Gigabit Switch', cost: 45000, salvage: 5000, vendor: 1 },
    { name: 'Lenovo ThinkPad T14', cat: 1, serial: 'LN-T14-001', config: 'Ryzen 7, 16GB, 512GB', cost: 95000, salvage: 12000, vendor: 3 },
    { name: 'Dell Latitude 7430', cat: 1, serial: 'DL-7430-001', config: 'i7, 32GB, 1TB SSD', cost: 135000, salvage: 18000, vendor: 1 },
    { name: 'HP EliteBook 840', cat: 1, serial: 'HP-EB840-001', config: 'i7, 16GB, 512GB', cost: 110000, salvage: 14000, vendor: 2 },
    { name: 'Cisco Meraki MR46', cat: 6, serial: 'CS-MR46-001', config: 'WiFi 6 Access Point', cost: 28000, salvage: 3000, vendor: 1 },
    { name: 'Dell PowerEdge T340', cat: 3, serial: 'DL-T340-001', config: 'Xeon E, 16GB, 1TB', cost: 180000, salvage: 25000, vendor: 1 },
    { name: 'HP ScanJet Pro 3000', cat: 5, serial: 'HP-SJ3K-001', config: 'Sheet-feed Scanner', cost: 22000, salvage: 2000, vendor: 2 },
    { name: 'Lenovo ThinkStation P340', cat: 2, serial: 'LN-P340-001', config: 'i9, 64GB, 2TB SSD', cost: 195000, salvage: 25000, vendor: 3 },
  ];

  const statuses = ['available', 'allocated', 'allocated', 'available', 'allocated', 'available', 'repair', 'available', 'allocated', 'allocated', 'available', 'available', 'repair', 'available', 'allocated'];
  const purchaseDates = [180, 400, 300, 600, 90, 200, 500, 350, 60, 30, 150, 250, 700, 120, 45];
  const maintCosts = [0, 3500, 1200, 12000, 0, 500, 8500, 2000, 0, 0, 1800, 0, 15000, 4000, 0];

  for (let i = 0; i < assetNames.length; i++) {
    const a = assetNames[i];
    assets.push({
      id: 6 + i, name: a.name, category_id: a.cat, serial_number: a.serial,
      configuration: a.config, purchase_date: daysAgo(purchaseDates[i]),
      purchase_cost: a.cost, salvage_value: a.salvage, useful_life_years: 5,
      vendor_id: a.vendor, status: statuses[i], qr_code: uuidv4(),
      maintenance_cost: maintCosts[i], created_at: now, updated_at: now,
    });
  }
  await qi.bulkInsert('assets', assets);
  console.log('15 additional assets seeded.');

  // ── ALLOCATIONS for new assets ──
  const allocations = [
    { asset_id: 7, user_id: 3, allocated_by: 1, allocation_date: daysAgo(380), location: 'Office - Floor 2', status: 'active', created_at: now, updated_at: now },
    { asset_id: 8, user_id: 4, allocated_by: 1, allocation_date: daysAgo(280), location: 'Office - Floor 3', status: 'active', created_at: now, updated_at: now },
    { asset_id: 11, user_id: 3, allocated_by: 1, allocation_date: daysAgo(80), location: 'Office - Floor 2', status: 'active', created_at: now, updated_at: now },
    { asset_id: 14, user_id: 4, allocated_by: 1, allocation_date: daysAgo(50), location: 'Remote / WFH', status: 'active', created_at: now, updated_at: now },
    { asset_id: 15, user_id: 3, allocated_by: 1, allocation_date: daysAgo(25), location: 'Office - Floor 1', status: 'active', created_at: now, updated_at: now },
    { asset_id: 16, user_id: 4, allocated_by: 1, allocation_date: daysAgo(20), location: 'Office - Floor 3', status: 'active', created_at: now, updated_at: now },
    { asset_id: 20, user_id: 3, allocated_by: 1, allocation_date: daysAgo(40), location: 'Office - Floor 2', status: 'active', created_at: now, updated_at: now },
  ];
  await qi.bulkInsert('asset_allocations', allocations);
  console.log('Allocations seeded.');

  // ── ASSET HISTORY for new assets ──
  const history = [];
  for (let i = 6; i <= 20; i++) {
    history.push({ asset_id: i, event_type: 'created', description: `Asset created`, performed_by: 1, created_at: daysAgo(purchaseDates[i - 6]) });
  }
  [7, 8, 11, 14, 15, 16, 20].forEach(id => {
    history.push({ asset_id: id, event_type: 'allocated', description: 'Allocated to employee', performed_by: 1, created_at: daysAgo(30) });
  });
  await qi.bulkInsert('asset_history', history);
  console.log('Asset history seeded.');

  // ── TICKETS (various statuses and priorities) ──
  const tickets = [
    { asset_id: 1, created_by: 3, issue_type: 'Hardware Failure', description: 'Laptop screen flickering intermittently', priority: 'high', status: 'open', reopen_count: 0, created_at: daysAgo(5), updated_at: now },
    { asset_id: 3, created_by: 4, issue_type: 'Software Issue', description: 'OS crashes during heavy workload', priority: 'critical', status: 'assigned', assigned_partner_id: 1, assigned_engineer_id: 1, reopen_count: 0, created_at: daysAgo(3), updated_at: now },
    { asset_id: 7, created_by: 3, issue_type: 'Performance Degradation', description: 'Desktop running very slow, high CPU usage', priority: 'medium', status: 'in_progress', assigned_engineer_id: 1, reopen_count: 0, created_at: daysAgo(7), updated_at: now },
    { asset_id: 5, created_by: 4, issue_type: 'Hardware Failure', description: 'Printer paper jam, roller needs replacement', priority: 'low', status: 'resolved', assigned_partner_id: 1, reopen_count: 0, created_at: daysAgo(15), updated_at: now },
    { asset_id: 11, created_by: 3, issue_type: 'Network Problem', description: 'WiFi keeps disconnecting on this monitor setup', priority: 'medium', status: 'open', reopen_count: 0, created_at: daysAgo(1), updated_at: now },
    { asset_id: 14, created_by: 4, issue_type: 'Software Issue', description: 'Cannot install required development tools', priority: 'high', status: 'assigned', assigned_partner_id: 1, reopen_count: 0, created_at: daysAgo(2), updated_at: now },
    { asset_id: 4, created_by: 1, issue_type: 'Hardware Failure', description: 'Server RAID controller showing warnings', priority: 'critical', status: 'in_progress', assigned_engineer_id: 1, reopen_count: 0, created_at: daysAgo(4), updated_at: now },
    { asset_id: 13, created_by: 1, issue_type: 'Performance Degradation', description: 'Switch port 12 intermittent connectivity', priority: 'high', status: 'waiting', assigned_partner_id: 1, reopen_count: 0, created_at: daysAgo(10), updated_at: now },
    { asset_id: 9, created_by: 1, issue_type: 'Hardware Failure', description: 'Server fan noise excessive', priority: 'medium', status: 'open', reopen_count: 0, created_at: daysAgo(2), updated_at: now },
    { asset_id: 20, created_by: 3, issue_type: 'Software Issue', description: 'Workstation BIOS needs update', priority: 'low', status: 'closed', assigned_engineer_id: 1, reopen_count: 0, created_at: daysAgo(20), updated_at: now },
  ];
  await qi.bulkInsert('tickets', tickets);
  console.log('10 tickets seeded.');

  // ── TICKET UPDATES ──
  const ticketUpdates = [
    { ticket_id: 2, updated_by: 1, old_status: 'open', new_status: 'assigned', comments: 'Assigned to TechServ Solutions', created_at: daysAgo(2) },
    { ticket_id: 3, updated_by: 7, old_status: 'assigned', new_status: 'in_progress', comments: 'Investigating CPU usage issue', created_at: daysAgo(5) },
    { ticket_id: 4, updated_by: 6, old_status: 'in_progress', new_status: 'resolved', comments: 'Roller replaced, printer working', created_at: daysAgo(10) },
    { ticket_id: 7, updated_by: 7, old_status: 'assigned', new_status: 'in_progress', comments: 'Checking RAID controller logs', created_at: daysAgo(3) },
    { ticket_id: 8, updated_by: 6, old_status: 'in_progress', new_status: 'waiting', comments: 'Waiting for replacement switch module', created_at: daysAgo(6) },
    { ticket_id: 10, updated_by: 7, old_status: 'in_progress', new_status: 'resolved', comments: 'BIOS updated successfully', created_at: daysAgo(15) },
    { ticket_id: 10, updated_by: 1, old_status: 'resolved', new_status: 'closed', comments: 'Confirmed working', created_at: daysAgo(14) },
  ];
  await qi.bulkInsert('ticket_updates', ticketUpdates);
  console.log('Ticket updates seeded.');

  // ── SLA TRACKING for assigned tickets ──
  const slaTracking = [
    { ticket_id: 2, sla_master_id: 1, assigned_time: daysAgo(2), response_due_time: daysAgo(1.96), resolution_due_time: daysAgo(1.83), response_status: 'pending', resolution_status: 'pending', assigned_partner_id: 1, assigned_engineer_id: 1, created_at: daysAgo(2), updated_at: now },
    { ticket_id: 3, sla_master_id: 3, assigned_time: daysAgo(6), response_due_time: daysAgo(5.83), resolution_due_time: daysAgo(5), response_status: 'met', resolution_status: 'pending', response_actual_time: daysAgo(5.9), assigned_engineer_id: 1, created_at: daysAgo(6), updated_at: now },
    { ticket_id: 7, sla_master_id: 1, assigned_time: daysAgo(3.5), response_due_time: daysAgo(3.46), resolution_due_time: daysAgo(3.33), response_status: 'met', resolution_status: 'pending', response_actual_time: daysAgo(3.48), assigned_engineer_id: 1, created_at: daysAgo(3.5), updated_at: now },
  ];
  await qi.bulkInsert('ticket_sla_tracking', slaTracking);
  console.log('SLA tracking seeded.');

  // ── ASSET REQUESTS (various statuses) ──
  const requests = [
    { user_id: 3, catalog_id: 1, request_type: 'new_asset', justification: 'Need a new laptop for development work, current one is too slow', status: 'pending_manager', created_at: daysAgo(1), updated_at: now },
    { user_id: 4, catalog_id: 2, request_type: 'new_asset', justification: 'Need external monitor for better productivity', status: 'pending_admin', created_at: daysAgo(3), updated_at: now },
    { user_id: 3, catalog_id: 3, request_type: 'new_asset', justification: 'Wireless keyboard and mouse for ergonomic setup', status: 'approved', created_at: daysAgo(10), updated_at: now },
    { user_id: 4, asset_id: 8, request_type: 'return', justification: 'Returning old desktop, received new laptop', status: 'approved', created_at: daysAgo(15), updated_at: now },
    { user_id: 3, catalog_id: 1, request_type: 'new_asset', justification: 'Replacement laptop needed urgently', status: 'rejected', created_at: daysAgo(20), updated_at: now },
    { user_id: 4, catalog_id: 2, request_type: 'new_asset', justification: 'Second monitor for dual-screen setup', status: 'pending_manager', created_at: daysAgo(2), updated_at: now },
  ];
  await qi.bulkInsert('asset_requests', requests);
  console.log('6 asset requests seeded.');

  // ── APPROVALS ──
  const approvals = [
    { request_id: 2, approver_id: 2, level: 'manager', action: 'approved', comments: 'Approved, good justification', created_at: daysAgo(2) },
    { request_id: 3, approver_id: 2, level: 'manager', action: 'approved', comments: 'Approved', created_at: daysAgo(8) },
    { request_id: 3, approver_id: 1, level: 'admin', action: 'approved', comments: 'Stock available, approved', created_at: daysAgo(7) },
    { request_id: 4, approver_id: 2, level: 'manager', action: 'approved', comments: 'Return approved', created_at: daysAgo(13) },
    { request_id: 4, approver_id: 1, level: 'admin', action: 'approved', comments: 'Processed', created_at: daysAgo(12) },
    { request_id: 5, approver_id: 2, level: 'manager', action: 'rejected', comments: 'Current laptop is still functional', created_at: daysAgo(18) },
  ];
  await qi.bulkInsert('approvals', approvals);
  console.log('Approvals seeded.');

  // ── CONTRACTS (some expiring soon) ──
  const contracts = [
    { vendor_id: 1, asset_id: 1, contract_type: 'warranty', start_date: daysAgo(365), end_date: daysAgo(-20), description: 'Dell Latitude warranty - expiring soon', status: 'active', created_at: now, updated_at: now },
    { vendor_id: 2, asset_id: 5, contract_type: 'amc', start_date: daysAgo(180), end_date: daysAgo(-10), description: 'HP Printer AMC - expiring soon', status: 'active', created_at: now, updated_at: now },
    { vendor_id: 1, asset_id: 4, contract_type: 'warranty', start_date: daysAgo(730), end_date: daysAgo(-365), description: 'Dell Server warranty', status: 'active', created_at: now, updated_at: now },
    { vendor_id: 3, asset_id: 3, contract_type: 'warranty', start_date: daysAgo(200), end_date: daysAgo(-180), description: 'Lenovo ThinkPad warranty', status: 'active', created_at: now, updated_at: now },
    { vendor_id: 2, contract_type: 'amc', start_date: daysAgo(90), end_date: daysAgo(-270), description: 'HP general AMC for all HP devices', status: 'active', created_at: now, updated_at: now },
  ];
  await qi.bulkInsert('contracts', contracts);
  console.log('5 contracts seeded.');

  // ── AGENT DATA (software, usage, errors) ──
  const agentLogs = [];
  // Software data for allocated assets
  [1, 3, 7, 8, 11, 14, 15, 16, 20].forEach(assetId => {
    agentLogs.push({
      asset_id: assetId, log_type: 'software',
      data: JSON.stringify(['Windows 11 Pro', 'Microsoft Office 365', 'Chrome', 'VS Code', 'Slack', 'Zoom', 'Node.js', 'Git']),
      created_at: daysAgo(1),
    });
  });
  // Usage data
  [1, 3, 7, 8, 14, 15].forEach((assetId, i) => {
    agentLogs.push({
      asset_id: assetId, log_type: 'usage',
      data: JSON.stringify({ cpu_avg: 35 + i * 8, ram_used_gb: 4 + i * 2, ram_total_gb: 16, disk_used_pct: 45 + i * 5 }),
      created_at: daysAgo(1),
    });
    agentLogs.push({
      asset_id: assetId, log_type: 'usage',
      data: JSON.stringify({ cpu_avg: 40 + i * 5, ram_used_gb: 5 + i, ram_total_gb: 16, disk_used_pct: 48 + i * 3 }),
      created_at: daysAgo(7),
    });
  });
  // Error logs
  [1, 7, 4].forEach(assetId => {
    agentLogs.push({
      asset_id: assetId, log_type: 'error',
      data: JSON.stringify({ error: 'Blue screen WHEA_UNCORRECTABLE_ERROR', timestamp: daysAgo(3), severity: 'critical' }),
      created_at: daysAgo(3),
    });
  });
  await qi.bulkInsert('asset_logs', agentLogs);
  console.log('Agent data (software, usage, errors) seeded.');

  // ── NOTIFICATIONS ──
  const notifications = [
    { user_id: 1, title: 'Maintenance Due', message: 'HP LaserJet Pro (HP-LJ-001) health score is below 50, maintenance recommended', type: 'maintenance', is_read: false, reference_type: 'asset', reference_id: 5, created_at: daysAgo(1) },
    { user_id: 1, title: 'Contract Expiring', message: 'Dell Latitude warranty expires in 20 days', type: 'warranty', is_read: false, reference_type: 'contract', reference_id: 1, created_at: daysAgo(1) },
    { user_id: 1, title: 'Contract Expiring', message: 'HP Printer AMC expires in 10 days', type: 'warranty', is_read: false, reference_type: 'contract', reference_id: 2, created_at: daysAgo(1) },
    { user_id: 1, title: 'New Approval Request', message: 'Priya Sharma submitted a new_asset request', type: 'approval', is_read: false, reference_type: 'request', reference_id: 1, created_at: daysAgo(1) },
    { user_id: 1, title: 'Critical Ticket', message: 'Server RAID controller showing warnings - critical priority', type: 'ticket', is_read: false, reference_type: 'ticket', reference_id: 7, created_at: daysAgo(4) },
    { user_id: 1, title: 'Health Warning', message: 'Dell PowerEdge R740 health score dropped below threshold', type: 'health', is_read: true, reference_type: 'asset', reference_id: 4, created_at: daysAgo(10) },
    { user_id: 2, title: 'Pending Approval', message: 'Priya Sharma requests a new laptop', type: 'approval', is_read: false, reference_type: 'request', reference_id: 1, created_at: daysAgo(1) },
    { user_id: 2, title: 'Pending Approval', message: 'Amit Patel requests a second monitor', type: 'approval', is_read: false, reference_type: 'request', reference_id: 6, created_at: daysAgo(2) },
    { user_id: 3, title: 'Request Approved', message: 'Your keyboard/mouse request has been approved', type: 'approval', is_read: true, reference_type: 'request', reference_id: 3, created_at: daysAgo(7) },
    { user_id: 3, title: 'Request Rejected', message: 'Your replacement laptop request was rejected', type: 'approval', is_read: true, reference_type: 'request', reference_id: 5, created_at: daysAgo(18) },
    { user_id: 3, title: 'Ticket Update', message: 'Ticket #3 status changed to in_progress', type: 'ticket', is_read: false, reference_type: 'ticket', reference_id: 3, created_at: daysAgo(5) },
    { user_id: 4, title: 'Request Approved', message: 'Your return request has been approved', type: 'approval', is_read: true, reference_type: 'request', reference_id: 4, created_at: daysAgo(12) },
    { user_id: 4, title: 'Ticket Assigned', message: 'Ticket #2 has been assigned to TechServ Solutions', type: 'ticket', is_read: false, reference_type: 'ticket', reference_id: 2, created_at: daysAgo(2) },
    { user_id: 6, title: 'New Ticket Assigned', message: 'Ticket #2 assigned to your organization', type: 'ticket', is_read: false, reference_type: 'ticket', reference_id: 2, created_at: daysAgo(2) },
    { user_id: 6, title: 'New Ticket Assigned', message: 'Ticket #8 assigned to your organization', type: 'ticket', is_read: false, reference_type: 'ticket', reference_id: 8, created_at: daysAgo(6) },
    { user_id: 7, title: 'New Ticket Assigned', message: 'Ticket #3 assigned to you', type: 'ticket', is_read: false, reference_type: 'ticket', reference_id: 3, created_at: daysAgo(5) },
    { user_id: 7, title: 'New Ticket Assigned', message: 'Ticket #7 assigned to you', type: 'ticket', is_read: false, reference_type: 'ticket', reference_id: 7, created_at: daysAgo(3) },
  ];
  await qi.bulkInsert('notifications', notifications);
  console.log('17 notifications seeded.');

  console.log('\nDashboard data seeded successfully!');
}

seed().then(() => process.exit(0)).catch(err => { console.error('Seed failed:', err.message); process.exit(1); });
