const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TicketPart = sequelize.define('TicketPart', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  ticket_id: { type: DataTypes.INTEGER, allowNull: false },
  part_name: { type: DataTypes.STRING(200), allowNull: false },
  quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
  cost: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  status: { type: DataTypes.ENUM('used', 'pending', 'returned'), defaultValue: 'pending' },
  updated_by: { type: DataTypes.INTEGER },
}, { tableName: 'ticket_parts', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

module.exports = TicketPart;
