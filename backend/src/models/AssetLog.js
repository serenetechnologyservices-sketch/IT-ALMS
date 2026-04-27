const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AssetLog = sequelize.define('AssetLog', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  asset_id: { type: DataTypes.INTEGER },
  log_type: { type: DataTypes.ENUM('software', 'usage', 'error') },
  data: { type: DataTypes.JSON },
}, { tableName: 'asset_logs', timestamps: true, createdAt: 'created_at', updatedAt: false });

module.exports = AssetLog;
