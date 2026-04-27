const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER },
  title: { type: DataTypes.STRING(200) },
  message: { type: DataTypes.TEXT },
  type: { type: DataTypes.ENUM('maintenance', 'warranty', 'approval', 'ticket', 'health') },
  is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
  reference_type: { type: DataTypes.STRING(50) },
  reference_id: { type: DataTypes.INTEGER },
}, { tableName: 'notifications', timestamps: true, createdAt: 'created_at', updatedAt: false });

module.exports = Notification;
