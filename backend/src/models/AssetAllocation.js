const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AssetAllocation = sequelize.define('AssetAllocation', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  asset_id: { type: DataTypes.INTEGER },
  user_id: { type: DataTypes.INTEGER },
  allocated_by: { type: DataTypes.INTEGER },
  allocation_date: { type: DataTypes.DATEONLY },
  return_date: { type: DataTypes.DATEONLY, allowNull: true },
  location: { type: DataTypes.STRING(200) },
  status: { type: DataTypes.ENUM('active', 'returned', 'transferred', 'scrapped'), defaultValue: 'active' },
  remarks: { type: DataTypes.TEXT, allowNull: true },
}, { tableName: 'asset_allocations', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

module.exports = AssetAllocation;
