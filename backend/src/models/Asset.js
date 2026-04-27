const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Asset = sequelize.define('Asset', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(200), allowNull: false },
  category_id: { type: DataTypes.INTEGER },
  serial_number: { type: DataTypes.STRING(100), unique: true },
  configuration: { type: DataTypes.TEXT },
  purchase_date: { type: DataTypes.DATEONLY },
  purchase_cost: { type: DataTypes.DECIMAL(12, 2) },
  salvage_value: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  useful_life_years: { type: DataTypes.INTEGER, defaultValue: 5 },
  vendor_id: { type: DataTypes.INTEGER, allowNull: true },
  status: { type: DataTypes.ENUM('available', 'allocated', 'repair', 'scrap'), defaultValue: 'available' },
  qr_code: { type: DataTypes.STRING(100), unique: true },
  agent_id: { type: DataTypes.STRING(100), unique: true, allowNull: true },
  maintenance_cost: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
}, { tableName: 'assets', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

module.exports = Asset;
