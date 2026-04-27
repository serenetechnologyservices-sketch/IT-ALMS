const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SlaMaster = sequelize.define('SlaMaster', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(200), allowNull: true },
  // SLA Level: L1=vendor, L2=category, L3=subcategory, L4=asset-specific
  sla_level: { type: DataTypes.ENUM('L1', 'L2', 'L3', 'L4'), defaultValue: 'L2' },
  priority: { type: DataTypes.ENUM('low', 'medium', 'high', 'critical'), allowNull: false },
  asset_category_id: { type: DataTypes.INTEGER, allowNull: true },
  subcategory: { type: DataTypes.STRING(100), allowNull: true },
  vendor_id: { type: DataTypes.INTEGER, allowNull: true },
  asset_id: { type: DataTypes.INTEGER, allowNull: true },
  // SLA Times
  response_time_hours: { type: DataTypes.DECIMAL(6, 2), allowNull: false },
  resolution_time_hours: { type: DataTypes.DECIMAL(6, 2), allowNull: false },
  acknowledgement_time_hours: { type: DataTypes.DECIMAL(6, 2), allowNull: true },
  // Business hours config
  business_hours_only: { type: DataTypes.BOOLEAN, defaultValue: false },
  business_start_hour: { type: DataTypes.INTEGER, defaultValue: 9 },
  business_end_hour: { type: DataTypes.INTEGER, defaultValue: 18 },
  // Pause conditions
  pause_on_statuses: { type: DataTypes.STRING(500), allowNull: true }, // comma-separated: "waiting,on_hold"
  // Start condition
  start_condition: { type: DataTypes.ENUM('on_creation', 'on_assignment', 'on_in_progress'), defaultValue: 'on_assignment' },
  status: { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active' },
}, { tableName: 'sla_master', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

module.exports = SlaMaster;
