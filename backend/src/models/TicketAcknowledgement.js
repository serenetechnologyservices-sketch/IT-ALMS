const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TicketAcknowledgement = sequelize.define('TicketAcknowledgement', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  ticket_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  signature_data: { type: DataTypes.TEXT, allowNull: true },
  feedback_rating: { type: DataTypes.INTEGER, allowNull: true },
  closure_confirmed: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { tableName: 'ticket_acknowledgements', timestamps: true, createdAt: 'created_at', updatedAt: false });

module.exports = TicketAcknowledgement;
