const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TicketAttachment = sequelize.define('TicketAttachment', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  ticket_id: { type: DataTypes.INTEGER, allowNull: false },
  file_name: { type: DataTypes.STRING(300), allowNull: false },
  file_path: { type: DataTypes.STRING(500), allowNull: false },
  file_type: { type: DataTypes.STRING(50) },
  file_size: { type: DataTypes.INTEGER },
  uploaded_by: { type: DataTypes.INTEGER },
}, { tableName: 'ticket_attachments', timestamps: true, createdAt: 'created_at', updatedAt: false });

module.exports = TicketAttachment;
