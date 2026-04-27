const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TicketWorkProgress = sequelize.define('TicketWorkProgress', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  ticket_id: { type: DataTypes.INTEGER, allowNull: false },
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
  updated_by: { type: DataTypes.INTEGER },
}, { tableName: 'ticket_work_progress', timestamps: true, createdAt: 'created_at', updatedAt: false });

module.exports = TicketWorkProgress;
