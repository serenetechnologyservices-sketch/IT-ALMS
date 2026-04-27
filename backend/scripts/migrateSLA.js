const sequelize = require('../src/config/database');
const { DataTypes } = require('sequelize');

async function migrate() {
  const qi = sequelize.getQueryInterface();

  await qi.createTable('sla_master', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    priority: { type: DataTypes.ENUM('low', 'medium', 'high', 'critical'), allowNull: false },
    asset_category_id: { type: DataTypes.INTEGER, references: { model: 'asset_categories', key: 'id' }, allowNull: true },
    response_time_hours: { type: DataTypes.DECIMAL(6, 2), allowNull: false },
    resolution_time_hours: { type: DataTypes.DECIMAL(6, 2), allowNull: false },
    status: { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active' },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  });

  await qi.createTable('ticket_sla_tracking', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    ticket_id: { type: DataTypes.INTEGER, references: { model: 'tickets', key: 'id' }, allowNull: false },
    sla_master_id: { type: DataTypes.INTEGER, references: { model: 'sla_master', key: 'id' }, allowNull: true },
    assigned_time: { type: DataTypes.DATE },
    response_due_time: { type: DataTypes.DATE },
    resolution_due_time: { type: DataTypes.DATE },
    response_actual_time: { type: DataTypes.DATE, allowNull: true },
    resolution_actual_time: { type: DataTypes.DATE, allowNull: true },
    response_status: { type: DataTypes.ENUM('pending', 'met', 'breached'), defaultValue: 'pending' },
    resolution_status: { type: DataTypes.ENUM('pending', 'met', 'breached'), defaultValue: 'pending' },
    assigned_partner_id: { type: DataTypes.INTEGER, references: { model: 'service_partners', key: 'id' }, allowNull: true },
    assigned_engineer_id: { type: DataTypes.INTEGER, references: { model: 'service_engineers', key: 'id' }, allowNull: true },
    delay_reason: { type: DataTypes.TEXT, allowNull: true },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  });

  // Seed default SLA rules
  const now = new Date();
  const slaRules = [
    { priority: 'critical', response_time_hours: 1, resolution_time_hours: 4, status: 'active', created_at: now, updated_at: now },
    { priority: 'high', response_time_hours: 2, resolution_time_hours: 8, status: 'active', created_at: now, updated_at: now },
    { priority: 'medium', response_time_hours: 4, resolution_time_hours: 24, status: 'active', created_at: now, updated_at: now },
    { priority: 'low', response_time_hours: 8, resolution_time_hours: 48, status: 'active', created_at: now, updated_at: now },
    // Category-specific overrides for servers (category 3)
    { priority: 'critical', asset_category_id: 3, response_time_hours: 0.5, resolution_time_hours: 2, status: 'active', created_at: now, updated_at: now },
    { priority: 'high', asset_category_id: 3, response_time_hours: 1, resolution_time_hours: 4, status: 'active', created_at: now, updated_at: now },
  ];
  await qi.bulkInsert('sla_master', slaRules);

  console.log('SLA tables created and seeded with default rules.');
}

migrate().then(() => process.exit(0)).catch(err => { console.error(err.message); process.exit(1); });
