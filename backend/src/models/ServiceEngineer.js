const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ServiceEngineer = sequelize.define('ServiceEngineer', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(200), allowNull: false },
  email: { type: DataTypes.STRING(200) },
  phone: { type: DataTypes.STRING(50) },
  specialization: { type: DataTypes.STRING(100) },
  partner_id: { type: DataTypes.INTEGER, allowNull: true },
  user_id: { type: DataTypes.INTEGER, allowNull: true },
  status: { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active' },
}, { tableName: 'service_engineers', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

module.exports = ServiceEngineer;
