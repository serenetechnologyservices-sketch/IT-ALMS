const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TicketUpdate = sequelize.define('TicketUpdate', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  ticket_id: { type: DataTypes.INTEGER },
  updated_by: { type: DataTypes.INTEGER },
  old_status: { type: DataTypes.STRING(50) },
  new_status: { type: DataTypes.STRING(50) },
  comments: { type: DataTypes.TEXT },
}, { tableName: 'ticket_updates', timestamps: true, createdAt: 'created_at', updatedAt: false });

module.exports = TicketUpdate;
