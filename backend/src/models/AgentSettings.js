const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AgentSettings = sequelize.define('AgentSettings', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  track_system_info: { type: DataTypes.BOOLEAN, defaultValue: true },
  track_software: { type: DataTypes.BOOLEAN, defaultValue: true },
  track_performance: { type: DataTypes.BOOLEAN, defaultValue: true },
  track_compliance: { type: DataTypes.BOOLEAN, defaultValue: true },
  system_info_interval_min: { type: DataTypes.INTEGER, defaultValue: 1440 },
  software_scan_interval_min: { type: DataTypes.INTEGER, defaultValue: 1440 },
  performance_interval_min: { type: DataTypes.INTEGER, defaultValue: 5 },
  compliance_interval_min: { type: DataTypes.INTEGER, defaultValue: 720 },
  sync_interval_min: { type: DataTypes.INTEGER, defaultValue: 2 },
}, { tableName: 'agent_settings', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

module.exports = AgentSettings;
