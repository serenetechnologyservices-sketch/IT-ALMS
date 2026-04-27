const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Catalog = sequelize.define('Catalog', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(200), allowNull: false },
  description: { type: DataTypes.TEXT },
  category_id: { type: DataTypes.INTEGER },
  image_url: { type: DataTypes.STRING(500) },
}, { tableName: 'catalog', timestamps: true, createdAt: 'created_at', updatedAt: 'updated_at' });

module.exports = Catalog;
