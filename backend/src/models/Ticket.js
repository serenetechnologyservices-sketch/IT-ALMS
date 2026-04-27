const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Ticket = sequelize.define('Ticket', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  ticket_type: { type: DataTypes.ENUM('incident', 'service_request', 'change_request'), defaultValue: 'incident' },
  asset_id: { type: DataTypes.INTEGER, allowNull: true },
  created_by: { type: DataTypes.INTEGER },
  title: { type: DataTypes.STRING(300), allowNull: true },
  issue_type: { type: DataTypes.STRING(100) },
  description: { type: DataTypes.TEXT },
  priority: { type: DataTypes.ENUM('low', 'medium', 'high', 'critical'), defaultValue: 'medium' },
  status: { type: DataTypes.ENUM('open', 'assigned', 'in_progress', 'waiting', 'on_hold', 'awaiting_parts', 'completed', 'resolved', 'closed'), defaultValue: 'open' },
  assigned_partner_id: { type: DataTypes.INTEGER, allowNull: true },
  assigned_engineer_id: { type: DataTypes.INTEGER, allowNull: true },
  assigned_group: { type: DataTypes.STRING(100), allowNull: true },
  // Classification
  category: { type: DataTypes.STRING(100), allowNull: true },
  subcategory: { type: DataTypes.STRING(100), allowNull: true },
  problem_type: { type: DataTypes.STRING(100), allowNull: true },
  urgency: { type: DataTypes.ENUM('low', 'medium', 'high', 'critical'), allowNull: true },
  impact: { type: DataTypes.ENUM('low', 'medium', 'high', 'critical'), allowNull: true },
  // Business context
  order_number: { type: DataTypes.STRING(100), allowNull: true },
  invoice_number: { type: DataTypes.STRING(100), allowNull: true },
  complaint_reference: { type: DataTypes.STRING(100), allowNull: true },
  contract_id: { type: DataTypes.INTEGER, allowNull: true },
  // Assignment
  region: { type: DataTypes.STRING(100), allowNull: true },
  zone: { type: DataTypes.STRING(100), allowNull: true },
  // Work execution
  visit_required: { type: DataTypes.BOOLEAN, defaultValue: false },
  // Resolution
  root_cause: { type: DataTypes.TEXT, allowNull: true },
  resolution_summary: { type: DataTypes.TEXT, allowNull: true },
  action_taken: { type: DataTypes.TEXT, allowNull: true },
  // Asset downtime
  downtime_start: { type: DataTypes.DATE, allowNull: true },
  downtime_end: { type: DataTypes.DATE, allowNull: true },
  downtime_duration: { type: DataTypes.DECIMAL(8, 2), allowNull: true },
  // Service Request fields
  request_type: { type: DataTypes.STRING(100), allowNull: true },
  requester_id: { type: DataTypes.INTEGER, allowNull: true },
  requested_for: { type: DataTypes.INTEGER, allowNull: true },
  catalog_item_id: { type: DataTypes.INTEGER, allowNull: true },
  quantity: { type: DataTypes.INTEGER, allowNull: true },
  configuration_details: { type: DataTypes.JSON, allowNull: true },
  justification: { type: DataTypes.TEXT, allowNull: true },
  approval_required: { type: DataTypes.BOOLEAN, defaultValue: false },
  approval_status: { type: DataTypes.ENUM('pending', 'approved', 'rejected', 'not_required'), defaultValue: 'not_required' },
  approved_by: { type: DataTypes.INTEGER, allowNull: true },
  approval_date: { type: DataTypes.DATE, allowNull: true },
  fulfillment_status: { type: DataTypes.STRING(50), allowNull: true },
  delivery_date: { type: DataTypes.DATEONLY, allowNull: true },
  new_asset_flag: { type: DataTypes.BOOLEAN, defaultValue: false },
  // Change Request fields
  change_type: { type: DataTypes.ENUM('standard', 'normal', 'emergency'), allowNull: true },
  planned_start_date: { type: DataTypes.DATE, allowNull: true },
  planned_end_date: { type: DataTypes.DATE, allowNull: true },
  actual_start_date: { type: DataTypes.DATE, allowNull: true },
  actual_end_date: { type: DataTypes.DATE, allowNull: true },
  risk_level: { type: DataTypes.ENUM('low', 'medium', 'high'), allowNull: true },
  impact_analysis: { type: DataTypes.TEXT, allowNull: true },
  rollback_plan: { type: DataTypes.TEXT, allowNull: true },
  implementation_plan: { type: DataTypes.TEXT, allowNull: true },
  testing_result: { type: DataTypes.TEXT, allowNull: true },
  affected_assets: { type: DataTypes.JSON, allowNull: true },
  affected_services: { type: DataTypes.JSON, allowNull: true },
  // Audit
  reopen_count: { type: DataTypes.INTEGER, defaultValue: 0 },
  last_updated_by: { type: DataTypes.INTEGER, allowNull: true },
}, { tableName: 'tickets', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

module.exports = Ticket;
