const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AssetRequest = sequelize.define('AssetRequest', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER },
  catalog_id: { type: DataTypes.INTEGER, allowNull: true },
  asset_id: { type: DataTypes.INTEGER, allowNull: true },
  request_type: { type: DataTypes.ENUM('new_asset', 'return') },
  justification: { type: DataTypes.TEXT },
  status: { type: DataTypes.ENUM('pending_manager', 'pending_admin', 'approved', 'rejected'), defaultValue: 'pending_manager' },
}, { tableName: 'asset_requests', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

module.exports = AssetRequest;
