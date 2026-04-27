const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ServicePartner = sequelize.define('ServicePartner', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(200), allowNull: false },
  contact_person: { type: DataTypes.STRING(200) },
  email: { type: DataTypes.STRING(200) },
  phone: { type: DataTypes.STRING(50) },
  service_type: { type: DataTypes.STRING(100) },
  user_id: { type: DataTypes.INTEGER, allowNull: true },
  status: { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active' },
}, { tableName: 'service_partners', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

module.exports = ServicePartner;
