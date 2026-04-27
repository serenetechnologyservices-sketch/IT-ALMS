const sequelize = require('../src/config/database');
const { DataTypes } = require('sequelize');

async function migrate() {
  const qi = sequelize.getQueryInterface();

  await qi.createTable('sub_masters', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    type: { type: DataTypes.STRING(50), allowNull: false },
    name: { type: DataTypes.STRING(200), allowNull: false },
    description: { type: DataTypes.STRING(500) },
    sort_order: { type: DataTypes.INTEGER, defaultValue: 0 },
    status: { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active' },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  });

  // Seed default sub-master data
  const now = new Date();
  const rows = [
    // Departments
    { type: 'department', name: 'IT', sort_order: 1, status: 'active', created_at: now, updated_at: now },
    { type: 'department', name: 'Engineering', sort_order: 2, status: 'active', created_at: now, updated_at: now },
    { type: 'department', name: 'Finance', sort_order: 3, status: 'active', created_at: now, updated_at: now },
    { type: 'department', name: 'HR', sort_order: 4, status: 'active', created_at: now, updated_at: now },
    { type: 'department', name: 'Operations', sort_order: 5, status: 'active', created_at: now, updated_at: now },
    { type: 'department', name: 'Sales', sort_order: 6, status: 'active', created_at: now, updated_at: now },
    { type: 'department', name: 'Marketing', sort_order: 7, status: 'active', created_at: now, updated_at: now },
    { type: 'department', name: 'Executive', sort_order: 8, status: 'active', created_at: now, updated_at: now },
    { type: 'department', name: 'External', sort_order: 9, status: 'active', created_at: now, updated_at: now },
    // Issue Types
    { type: 'issue_type', name: 'Hardware Failure', sort_order: 1, status: 'active', created_at: now, updated_at: now },
    { type: 'issue_type', name: 'Software Issue', sort_order: 2, status: 'active', created_at: now, updated_at: now },
    { type: 'issue_type', name: 'Network Problem', sort_order: 3, status: 'active', created_at: now, updated_at: now },
    { type: 'issue_type', name: 'Performance Degradation', sort_order: 4, status: 'active', created_at: now, updated_at: now },
    { type: 'issue_type', name: 'Data Loss', sort_order: 5, status: 'active', created_at: now, updated_at: now },
    { type: 'issue_type', name: 'Security Incident', sort_order: 6, status: 'active', created_at: now, updated_at: now },
    { type: 'issue_type', name: 'Peripheral Issue', sort_order: 7, status: 'active', created_at: now, updated_at: now },
    { type: 'issue_type', name: 'Other', sort_order: 8, status: 'active', created_at: now, updated_at: now },
    // Locations
    { type: 'location', name: 'Office - Floor 1', sort_order: 1, status: 'active', created_at: now, updated_at: now },
    { type: 'location', name: 'Office - Floor 2', sort_order: 2, status: 'active', created_at: now, updated_at: now },
    { type: 'location', name: 'Office - Floor 3', sort_order: 3, status: 'active', created_at: now, updated_at: now },
    { type: 'location', name: 'Server Room', sort_order: 4, status: 'active', created_at: now, updated_at: now },
    { type: 'location', name: 'Warehouse', sort_order: 5, status: 'active', created_at: now, updated_at: now },
    { type: 'location', name: 'Remote / WFH', sort_order: 6, status: 'active', created_at: now, updated_at: now },
    // Service Types
    { type: 'service_type', name: 'Hardware Repair', sort_order: 1, status: 'active', created_at: now, updated_at: now },
    { type: 'service_type', name: 'Software Support', sort_order: 2, status: 'active', created_at: now, updated_at: now },
    { type: 'service_type', name: 'Network Services', sort_order: 3, status: 'active', created_at: now, updated_at: now },
    { type: 'service_type', name: 'AMC Services', sort_order: 4, status: 'active', created_at: now, updated_at: now },
    { type: 'service_type', name: 'Installation', sort_order: 5, status: 'active', created_at: now, updated_at: now },
    // Specializations
    { type: 'specialization', name: 'Laptop Repair', sort_order: 1, status: 'active', created_at: now, updated_at: now },
    { type: 'specialization', name: 'Desktop Repair', sort_order: 2, status: 'active', created_at: now, updated_at: now },
    { type: 'specialization', name: 'Server Maintenance', sort_order: 3, status: 'active', created_at: now, updated_at: now },
    { type: 'specialization', name: 'Network Engineering', sort_order: 4, status: 'active', created_at: now, updated_at: now },
    { type: 'specialization', name: 'Printer Repair', sort_order: 5, status: 'active', created_at: now, updated_at: now },
    // Vendor Service Types
    { type: 'vendor_service_type', name: 'Hardware', sort_order: 1, status: 'active', created_at: now, updated_at: now },
    { type: 'vendor_service_type', name: 'Software', sort_order: 2, status: 'active', created_at: now, updated_at: now },
    { type: 'vendor_service_type', name: 'Networking', sort_order: 3, status: 'active', created_at: now, updated_at: now },
    { type: 'vendor_service_type', name: 'Cloud Services', sort_order: 4, status: 'active', created_at: now, updated_at: now },
    { type: 'vendor_service_type', name: 'Consulting', sort_order: 5, status: 'active', created_at: now, updated_at: now },
    // Ticket Categories
    { type: 'ticket_category', name: 'Hardware', sort_order: 1, status: 'active', created_at: now, updated_at: now },
    { type: 'ticket_category', name: 'Software', sort_order: 2, status: 'active', created_at: now, updated_at: now },
    { type: 'ticket_category', name: 'Network', sort_order: 3, status: 'active', created_at: now, updated_at: now },
    { type: 'ticket_category', name: 'Billing', sort_order: 4, status: 'active', created_at: now, updated_at: now },
    { type: 'ticket_category', name: 'Security', sort_order: 5, status: 'active', created_at: now, updated_at: now },
    // Ticket Subcategories
    { type: 'ticket_subcategory', name: 'Laptop', sort_order: 1, status: 'active', created_at: now, updated_at: now },
    { type: 'ticket_subcategory', name: 'Desktop', sort_order: 2, status: 'active', created_at: now, updated_at: now },
    { type: 'ticket_subcategory', name: 'Server', sort_order: 3, status: 'active', created_at: now, updated_at: now },
    { type: 'ticket_subcategory', name: 'Printer', sort_order: 4, status: 'active', created_at: now, updated_at: now },
    { type: 'ticket_subcategory', name: 'Operating System', sort_order: 5, status: 'active', created_at: now, updated_at: now },
    { type: 'ticket_subcategory', name: 'Application', sort_order: 6, status: 'active', created_at: now, updated_at: now },
    { type: 'ticket_subcategory', name: 'WiFi', sort_order: 7, status: 'active', created_at: now, updated_at: now },
    { type: 'ticket_subcategory', name: 'LAN', sort_order: 8, status: 'active', created_at: now, updated_at: now },
    // Problem Types
    { type: 'problem_type', name: 'Not Working', sort_order: 1, status: 'active', created_at: now, updated_at: now },
    { type: 'problem_type', name: 'Slow Performance', sort_order: 2, status: 'active', created_at: now, updated_at: now },
    { type: 'problem_type', name: 'Intermittent Failure', sort_order: 3, status: 'active', created_at: now, updated_at: now },
    { type: 'problem_type', name: 'Configuration Issue', sort_order: 4, status: 'active', created_at: now, updated_at: now },
    { type: 'problem_type', name: 'Installation Required', sort_order: 5, status: 'active', created_at: now, updated_at: now },
    { type: 'problem_type', name: 'Upgrade Required', sort_order: 6, status: 'active', created_at: now, updated_at: now },
  ];

  await qi.bulkInsert('sub_masters', rows);
  console.log('sub_masters table created and seeded.');
}

migrate().then(() => process.exit(0)).catch(err => { console.error(err.message); process.exit(1); });
