const sequelize = require('../src/config/database');
const { DataTypes } = require('sequelize');

async function migrate() {
  const qi = sequelize.getQueryInterface();

  // 1. roles
  await qi.createTable('roles', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    description: { type: DataTypes.STRING(255) },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  });

  // 2. users
  await qi.createTable('users', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    username: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    password: { type: DataTypes.STRING(255), allowNull: false },
    full_name: { type: DataTypes.STRING(200), allowNull: false },
    email: { type: DataTypes.STRING(200), unique: true },
    role_id: { type: DataTypes.INTEGER, references: { model: 'roles', key: 'id' } },
    manager_id: { type: DataTypes.INTEGER, references: { model: 'users', key: 'id' }, allowNull: true },
    department: { type: DataTypes.STRING(100) },
    status: { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active' },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  });

  // 3. asset_categories
  await qi.createTable('asset_categories', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    description: { type: DataTypes.STRING(255) },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  });

  // 4. vendors
  await qi.createTable('vendors', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(200), allowNull: false },
    contact_person: { type: DataTypes.STRING(200) },
    email: { type: DataTypes.STRING(200) },
    phone: { type: DataTypes.STRING(50) },
    service_type: { type: DataTypes.STRING(100) },
    address: { type: DataTypes.TEXT },
    status: { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active' },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  });

  // 5. assets
  await qi.createTable('assets', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(200), allowNull: false },
    category_id: { type: DataTypes.INTEGER, references: { model: 'asset_categories', key: 'id' } },
    serial_number: { type: DataTypes.STRING(100), unique: true },
    configuration: { type: DataTypes.TEXT },
    purchase_date: { type: DataTypes.DATEONLY },
    purchase_cost: { type: DataTypes.DECIMAL(12, 2) },
    salvage_value: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    useful_life_years: { type: DataTypes.INTEGER, defaultValue: 5 },
    vendor_id: { type: DataTypes.INTEGER, references: { model: 'vendors', key: 'id' }, allowNull: true },
    status: { type: DataTypes.ENUM('available', 'allocated', 'repair', 'scrap'), defaultValue: 'available' },
    qr_code: { type: DataTypes.STRING(100), unique: true },
    maintenance_cost: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  });

  // 6. asset_allocations
  await qi.createTable('asset_allocations', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    asset_id: { type: DataTypes.INTEGER, references: { model: 'assets', key: 'id' } },
    user_id: { type: DataTypes.INTEGER, references: { model: 'users', key: 'id' } },
    allocated_by: { type: DataTypes.INTEGER, references: { model: 'users', key: 'id' } },
    allocation_date: { type: DataTypes.DATEONLY },
    return_date: { type: DataTypes.DATEONLY, allowNull: true },
    location: { type: DataTypes.STRING(200) },
    status: { type: DataTypes.ENUM('active', 'returned', 'transferred'), defaultValue: 'active' },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  });

  // 7. asset_history
  await qi.createTable('asset_history', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    asset_id: { type: DataTypes.INTEGER, references: { model: 'assets', key: 'id' } },
    event_type: { type: DataTypes.ENUM('created', 'allocated', 'transferred', 'returned', 'scrapped', 'maintenance', 'status_change') },
    description: { type: DataTypes.TEXT },
    performed_by: { type: DataTypes.INTEGER, references: { model: 'users', key: 'id' } },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  });

  // 8. asset_logs (agent data)
  await qi.createTable('asset_logs', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    asset_id: { type: DataTypes.INTEGER, references: { model: 'assets', key: 'id' } },
    log_type: { type: DataTypes.ENUM('software', 'usage', 'error') },
    data: { type: DataTypes.JSON },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  });

  // 9. contracts
  await qi.createTable('contracts', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    vendor_id: { type: DataTypes.INTEGER, references: { model: 'vendors', key: 'id' } },
    asset_id: { type: DataTypes.INTEGER, references: { model: 'assets', key: 'id' }, allowNull: true },
    contract_type: { type: DataTypes.ENUM('warranty', 'amc') },
    start_date: { type: DataTypes.DATEONLY },
    end_date: { type: DataTypes.DATEONLY },
    description: { type: DataTypes.TEXT },
    status: { type: DataTypes.ENUM('active', 'expired'), defaultValue: 'active' },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  });

  // 10. catalog
  await qi.createTable('catalog', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(200), allowNull: false },
    description: { type: DataTypes.TEXT },
    category_id: { type: DataTypes.INTEGER, references: { model: 'asset_categories', key: 'id' } },
    image_url: { type: DataTypes.STRING(500) },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  });

  // 11. inventory
  await qi.createTable('inventory', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    catalog_id: { type: DataTypes.INTEGER, references: { model: 'catalog', key: 'id' } },
    available: { type: DataTypes.INTEGER, defaultValue: 0 },
    allocated: { type: DataTypes.INTEGER, defaultValue: 0 },
    reserved: { type: DataTypes.INTEGER, defaultValue: 0 },
    scrap: { type: DataTypes.INTEGER, defaultValue: 0 },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  });

  // 12. asset_requests
  await qi.createTable('asset_requests', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, references: { model: 'users', key: 'id' } },
    catalog_id: { type: DataTypes.INTEGER, references: { model: 'catalog', key: 'id' }, allowNull: true },
    asset_id: { type: DataTypes.INTEGER, references: { model: 'assets', key: 'id' }, allowNull: true },
    request_type: { type: DataTypes.ENUM('new_asset', 'return') },
    justification: { type: DataTypes.TEXT },
    status: { type: DataTypes.ENUM('pending_manager', 'pending_admin', 'approved', 'rejected'), defaultValue: 'pending_manager' },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  });

  // 13. approvals
  await qi.createTable('approvals', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    request_id: { type: DataTypes.INTEGER, references: { model: 'asset_requests', key: 'id' } },
    approver_id: { type: DataTypes.INTEGER, references: { model: 'users', key: 'id' } },
    level: { type: DataTypes.ENUM('manager', 'admin') },
    action: { type: DataTypes.ENUM('approved', 'rejected') },
    comments: { type: DataTypes.TEXT },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  });

  // 14. service_partners
  await qi.createTable('service_partners', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(200), allowNull: false },
    contact_person: { type: DataTypes.STRING(200) },
    email: { type: DataTypes.STRING(200) },
    phone: { type: DataTypes.STRING(50) },
    service_type: { type: DataTypes.STRING(100) },
    user_id: { type: DataTypes.INTEGER, references: { model: 'users', key: 'id' }, allowNull: true },
    status: { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active' },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  });

  // 15. service_engineers
  await qi.createTable('service_engineers', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(200), allowNull: false },
    email: { type: DataTypes.STRING(200) },
    phone: { type: DataTypes.STRING(50) },
    specialization: { type: DataTypes.STRING(100) },
    partner_id: { type: DataTypes.INTEGER, references: { model: 'service_partners', key: 'id' }, allowNull: true },
    user_id: { type: DataTypes.INTEGER, references: { model: 'users', key: 'id' }, allowNull: true },
    status: { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active' },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  });

  // 16. tickets
  await qi.createTable('tickets', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    asset_id: { type: DataTypes.INTEGER, references: { model: 'assets', key: 'id' } },
    created_by: { type: DataTypes.INTEGER, references: { model: 'users', key: 'id' } },
    issue_type: { type: DataTypes.STRING(100) },
    description: { type: DataTypes.TEXT },
    priority: { type: DataTypes.ENUM('low', 'medium', 'high', 'critical'), defaultValue: 'medium' },
    status: { type: DataTypes.ENUM('open', 'assigned', 'in_progress', 'waiting', 'on_hold', 'awaiting_parts', 'completed', 'resolved', 'closed'), defaultValue: 'open' },
    assigned_partner_id: { type: DataTypes.INTEGER, references: { model: 'service_partners', key: 'id' }, allowNull: true },
    assigned_engineer_id: { type: DataTypes.INTEGER, references: { model: 'service_engineers', key: 'id' }, allowNull: true },
    title: { type: DataTypes.STRING(300), allowNull: true },
    category: { type: DataTypes.STRING(100), allowNull: true },
    subcategory: { type: DataTypes.STRING(100), allowNull: true },
    problem_type: { type: DataTypes.STRING(100), allowNull: true },
    urgency: { type: DataTypes.ENUM('low', 'medium', 'high', 'critical'), allowNull: true },
    order_number: { type: DataTypes.STRING(100), allowNull: true },
    invoice_number: { type: DataTypes.STRING(100), allowNull: true },
    complaint_reference: { type: DataTypes.STRING(100), allowNull: true },
    contract_id: { type: DataTypes.INTEGER, references: { model: 'contracts', key: 'id' }, allowNull: true },
    region: { type: DataTypes.STRING(100), allowNull: true },
    zone: { type: DataTypes.STRING(100), allowNull: true },
    reopen_count: { type: DataTypes.INTEGER, defaultValue: 0 },
    last_updated_by: { type: DataTypes.INTEGER, references: { model: 'users', key: 'id' }, allowNull: true },
    root_cause: { type: DataTypes.TEXT, allowNull: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  });

  // 17. ticket_updates
  await qi.createTable('ticket_updates', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    ticket_id: { type: DataTypes.INTEGER, references: { model: 'tickets', key: 'id' } },
    updated_by: { type: DataTypes.INTEGER, references: { model: 'users', key: 'id' } },
    old_status: { type: DataTypes.STRING(50) },
    new_status: { type: DataTypes.STRING(50) },
    comments: { type: DataTypes.TEXT },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  });

  // 18. notifications
  await qi.createTable('notifications', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, references: { model: 'users', key: 'id' } },
    title: { type: DataTypes.STRING(200) },
    message: { type: DataTypes.TEXT },
    type: { type: DataTypes.ENUM('maintenance', 'warranty', 'approval', 'ticket', 'health') },
    is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
    reference_type: { type: DataTypes.STRING(50) },
    reference_id: { type: DataTypes.INTEGER },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  });

  console.log('All core tables created successfully.');

  // 19. ticket_attachments
  await qi.createTable('ticket_attachments', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    ticket_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'tickets', key: 'id' } },
    file_name: { type: DataTypes.STRING(300), allowNull: false },
    file_path: { type: DataTypes.STRING(500), allowNull: false },
    file_type: { type: DataTypes.STRING(50) },
    file_size: { type: DataTypes.INTEGER },
    uploaded_by: { type: DataTypes.INTEGER, references: { model: 'users', key: 'id' } },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  });

  // 20. ticket_work_progress
  await qi.createTable('ticket_work_progress', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    ticket_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'tickets', key: 'id' } },
    work_notes: { type: DataTypes.TEXT, allowNull: true },
    customer_comments: { type: DataTypes.TEXT, allowNull: true },
    technician_name: { type: DataTypes.STRING(200), allowNull: true },
    technician_id: { type: DataTypes.STRING(100), allowNull: true },
    visit_date: { type: DataTypes.DATEONLY, allowNull: true },
    check_in_time: { type: DataTypes.DATE, allowNull: true },
    check_out_time: { type: DataTypes.DATE, allowNull: true },
    root_cause: { type: DataTypes.TEXT, allowNull: true },
    resolution_summary: { type: DataTypes.TEXT, allowNull: true },
    action_taken: { type: DataTypes.TEXT, allowNull: true },
    work_start_time: { type: DataTypes.DATE, allowNull: true },
    work_end_time: { type: DataTypes.DATE, allowNull: true },
    total_effort_hours: { type: DataTypes.DECIMAL(6, 2), allowNull: true },
    updated_by: { type: DataTypes.INTEGER, references: { model: 'users', key: 'id' } },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  });

  // 21. ticket_parts
  await qi.createTable('ticket_parts', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    ticket_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'tickets', key: 'id' } },
    part_name: { type: DataTypes.STRING(200), allowNull: false },
    quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
    cost: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    status: { type: DataTypes.ENUM('used', 'pending', 'returned'), defaultValue: 'pending' },
    updated_by: { type: DataTypes.INTEGER, references: { model: 'users', key: 'id' } },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  });

  // 22. ticket_acknowledgements
  await qi.createTable('ticket_acknowledgements', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    ticket_id: { type: DataTypes.INTEGER, allowNull: false, unique: true, references: { model: 'tickets', key: 'id' } },
    signature_data: { type: DataTypes.TEXT, allowNull: true },
    feedback_rating: { type: DataTypes.INTEGER, allowNull: true },
    closure_confirmed: { type: DataTypes.BOOLEAN, defaultValue: false },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  });

  // 23. ticket_escalations
  await qi.createTable('ticket_escalations', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    ticket_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'tickets', key: 'id' } },
    escalation_level: { type: DataTypes.INTEGER, allowNull: false },
    escalation_reason: { type: DataTypes.TEXT },
    escalated_to: { type: DataTypes.INTEGER, references: { model: 'users', key: 'id' } },
    escalated_by: { type: DataTypes.INTEGER, references: { model: 'users', key: 'id' } },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  });

  console.log('All tables created successfully.');
}

migrate()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Migration failed:', err.message);
    process.exit(1);
  });
