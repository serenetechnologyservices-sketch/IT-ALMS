const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TicketEscalation = sequelize.define('TicketEscalation', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  ticket_id: { type: DataTypes.INTEGER, allowNull: false },
  escalation_level: { type: DataTypes.INTEGER, allowNull: false },
  escalation_reason: { type: DataTypes.TEXT },
  escalated_to: { type: DataTypes.INTEGER },
  escalated_by: { type: DataTypes.INTEGER },
}, { tableName: 'ticket_escalations', timestamps: true, createdAt: 'created_at', updatedAt: false });

module.exports = TicketEscalation;
