const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AssetHistory = sequelize.define('AssetHistory', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  asset_id: { type: DataTypes.INTEGER },
  event_type: { type: DataTypes.ENUM('created', 'allocated', 'transferred', 'returned', 'scrapped', 'maintenance', 'status_change') },
  description: { type: DataTypes.TEXT },
  performed_by: { type: DataTypes.INTEGER },
}, { tableName: 'asset_history', timestamps: true, createdAt: 'created_at', updatedAt: false });

module.exports = AssetHistory;
