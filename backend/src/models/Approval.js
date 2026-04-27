const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Approval = sequelize.define('Approval', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  request_id: { type: DataTypes.INTEGER },
  approver_id: { type: DataTypes.INTEGER },
  level: { type: DataTypes.ENUM('manager', 'admin') },
  action: { type: DataTypes.ENUM('approved', 'rejected') },
  comments: { type: DataTypes.TEXT },
}, { tableName: 'approvals', timestamps: true, createdAt: 'created_at', updatedAt: false });

module.exports = Approval;
