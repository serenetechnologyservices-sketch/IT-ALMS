const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TicketSlaTracking = sequelize.define('TicketSlaTracking', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  ticket_id: { type: DataTypes.INTEGER, allowNull: false },
  sla_master_id: { type: DataTypes.INTEGER, allowNull: true },
  assigned_time: { type: DataTypes.DATE },
  // Response SLA
  response_due_time: { type: DataTypes.DATE },
  response_actual_time: { type: DataTypes.DATE, allowNull: true },
  response_status: { type: DataTypes.ENUM('pending', 'met', 'breached'), defaultValue: 'pending' },
  // Resolution SLA
  resolution_due_time: { type: DataTypes.DATE },
  resolution_actual_time: { type: DataTypes.DATE, allowNull: true },
  resolution_status: { type: DataTypes.ENUM('pending', 'met', 'breached'), defaultValue: 'pending' },
  // Acknowledgement SLA
  acknowledgement_due_time: { type: DataTypes.DATE, allowNull: true },
  acknowledgement_actual_time: { type: DataTypes.DATE, allowNull: true },
  acknowledgement_status: { type: DataTypes.ENUM('pending', 'met', 'breached', 'na'), defaultValue: 'na' },
  // Pause tracking
  is_paused: { type: DataTypes.BOOLEAN, defaultValue: false },
  paused_at: { type: DataTypes.DATE, allowNull: true },
  total_paused_ms: { type: DataTypes.BIGINT, defaultValue: 0 },
  pause_count: { type: DataTypes.INTEGER, defaultValue: 0 },
  // Assignment
  assigned_partner_id: { type: DataTypes.INTEGER, allowNull: true },
  assigned_engineer_id: { type: DataTypes.INTEGER, allowNull: true },
  delay_reason: { type: DataTypes.TEXT, allowNull: true },
}, { tableName: 'ticket_sla_tracking', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

module.exports = TicketSlaTracking;
