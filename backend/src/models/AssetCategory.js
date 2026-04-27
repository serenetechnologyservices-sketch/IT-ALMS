const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AssetCategory = sequelize.define('AssetCategory', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  description: { type: DataTypes.STRING(255) },
}, { tableName: 'asset_categories', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

module.exports = AssetCategory;
