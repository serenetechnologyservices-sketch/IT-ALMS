const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Vendor = sequelize.define('Vendor', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(200), allowNull: false },
  contact_person: { type: DataTypes.STRING(200) },
  email: { type: DataTypes.STRING(200) },
  phone: { type: DataTypes.STRING(50) },
  service_type: { type: DataTypes.STRING(100) },
  address: { type: DataTypes.TEXT },
  status: { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active' },
}, { tableName: 'vendors', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

module.exports = Vendor;
