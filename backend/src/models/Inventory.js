const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Inventory = sequelize.define('Inventory', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  catalog_id: { type: DataTypes.INTEGER },
  available: { type: DataTypes.INTEGER, defaultValue: 0 },
  allocated: { type: DataTypes.INTEGER, defaultValue: 0 },
  reserved: { type: DataTypes.INTEGER, defaultValue: 0 },
  scrap: { type: DataTypes.INTEGER, defaultValue: 0 },
}, { tableName: 'inventory', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

module.exports = Inventory;
