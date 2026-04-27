const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SubMaster = sequelize.define('SubMaster', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  type: { type: DataTypes.STRING(50), allowNull: false },
  name: { type: DataTypes.STRING(200), allowNull: false },
  description: { type: DataTypes.STRING(500) },
  sort_order: { type: DataTypes.INTEGER, defaultValue: 0 },
  status: { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active' },
}, { tableName: 'sub_masters', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

module.exports = SubMaster;
