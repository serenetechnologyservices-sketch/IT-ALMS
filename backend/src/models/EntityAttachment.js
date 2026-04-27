const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EntityAttachment = sequelize.define('EntityAttachment', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  entity_type: { type: DataTypes.STRING(50), allowNull: false }, // catalog, allocation, vendor, contract, service_partner, user
  entity_id: { type: DataTypes.INTEGER, allowNull: false },
  file_name: { type: DataTypes.STRING(300), allowNull: false },
  file_path: { type: DataTypes.STRING(500), allowNull: false },
  file_type: { type: DataTypes.STRING(50) },
  file_size: { type: DataTypes.INTEGER },
  uploaded_by: { type: DataTypes.INTEGER },
}, { tableName: 'entity_attachments', timestamps: true, createdAt: 'created_at', updatedAt: false });

module.exports = EntityAttachment;
