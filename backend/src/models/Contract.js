const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Contract = sequelize.define('Contract', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  vendor_id: { type: DataTypes.INTEGER },
  asset_id: { type: DataTypes.INTEGER, allowNull: true },
  contract_type: { type: DataTypes.ENUM('warranty', 'amc') },
  start_date: { type: DataTypes.DATEONLY },
  end_date: { type: DataTypes.DATEONLY },
  description: { type: DataTypes.TEXT },
  status: { type: DataTypes.ENUM('active', 'expired'), defaultValue: 'active' },
}, { tableName: 'contracts', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

module.exports = Contract;
