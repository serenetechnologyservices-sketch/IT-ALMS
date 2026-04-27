const sequelize = require('../config/database');
const Role = require('./Role');
const User = require('./User');
const AssetCategory = require('./AssetCategory');
const Asset = require('./Asset');
const AssetAllocation = require('./AssetAllocation');
const AssetHistory = require('./AssetHistory');
const AssetLog = require('./AssetLog');
const Vendor = require('./Vendor');
const Contract = require('./Contract');
const Catalog = require('./Catalog');
const Inventory = require('./Inventory');
const AssetRequest = require('./AssetRequest');
const Approval = require('./Approval');
const Ticket = require('./Ticket');
const TicketUpdate = require('./TicketUpdate');
const ServicePartner = require('./ServicePartner');
const ServiceEngineer = require('./ServiceEngineer');
const Notification = require('./Notification');
const SubMaster = require('./SubMaster');
const SlaMaster = require('./SlaMaster');
const TicketSlaTracking = require('./TicketSlaTracking');
const AgentSettings = require('./AgentSettings');
const TicketAttachment = require('./TicketAttachment');
const TicketWorkProgress = require('./TicketWorkProgress');
const TicketPart = require('./TicketPart');
const TicketAcknowledgement = require('./TicketAcknowledgement');
const TicketEscalation = require('./TicketEscalation');
const EntityAttachment = require('./EntityAttachment');

// User <-> Role
Role.hasMany(User, { foreignKey: 'role_id', as: 'users' });
User.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });
User.belongsTo(User, { foreignKey: 'manager_id', as: 'manager' });
User.hasMany(User, { foreignKey: 'manager_id', as: 'subordinates' });

// Asset <-> Category, Vendor
AssetCategory.hasMany(Asset, { foreignKey: 'category_id' });
Asset.belongsTo(AssetCategory, { foreignKey: 'category_id', as: 'category' });
Vendor.hasMany(Asset, { foreignKey: 'vendor_id' });
Asset.belongsTo(Vendor, { foreignKey: 'vendor_id', as: 'vendor' });

// Allocations
Asset.hasMany(AssetAllocation, { foreignKey: 'asset_id', as: 'allocations' });
AssetAllocation.belongsTo(Asset, { foreignKey: 'asset_id', as: 'asset' });
User.hasMany(AssetAllocation, { foreignKey: 'user_id', as: 'allocations' });
AssetAllocation.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
AssetAllocation.belongsTo(User, { foreignKey: 'allocated_by', as: 'allocator' });

// History
Asset.hasMany(AssetHistory, { foreignKey: 'asset_id', as: 'history' });
AssetHistory.belongsTo(Asset, { foreignKey: 'asset_id' });
AssetHistory.belongsTo(User, { foreignKey: 'performed_by', as: 'performer' });

// Logs
Asset.hasMany(AssetLog, { foreignKey: 'asset_id', as: 'logs' });
AssetLog.belongsTo(Asset, { foreignKey: 'asset_id' });

// Contracts
Vendor.hasMany(Contract, { foreignKey: 'vendor_id', as: 'contracts' });
Contract.belongsTo(Vendor, { foreignKey: 'vendor_id', as: 'vendor' });
Asset.hasMany(Contract, { foreignKey: 'asset_id' });
Contract.belongsTo(Asset, { foreignKey: 'asset_id', as: 'asset' });

// Catalog & Inventory
AssetCategory.hasMany(Catalog, { foreignKey: 'category_id' });
Catalog.belongsTo(AssetCategory, { foreignKey: 'category_id', as: 'category' });
Catalog.hasOne(Inventory, { foreignKey: 'catalog_id', as: 'inventory' });
Inventory.belongsTo(Catalog, { foreignKey: 'catalog_id', as: 'catalog' });

// Requests & Approvals
User.hasMany(AssetRequest, { foreignKey: 'user_id' });
AssetRequest.belongsTo(User, { foreignKey: 'user_id', as: 'requester' });
Catalog.hasMany(AssetRequest, { foreignKey: 'catalog_id' });
AssetRequest.belongsTo(Catalog, { foreignKey: 'catalog_id', as: 'catalogItem' });
Asset.hasMany(AssetRequest, { foreignKey: 'asset_id' });
AssetRequest.belongsTo(Asset, { foreignKey: 'asset_id', as: 'asset' });
AssetRequest.hasMany(Approval, { foreignKey: 'request_id', as: 'approvals' });
Approval.belongsTo(AssetRequest, { foreignKey: 'request_id', as: 'request' });
Approval.belongsTo(User, { foreignKey: 'approver_id', as: 'approver' });

// Tickets
Asset.hasMany(Ticket, { foreignKey: 'asset_id' });
Ticket.belongsTo(Asset, { foreignKey: 'asset_id', as: 'asset' });
User.hasMany(Ticket, { foreignKey: 'created_by' });
Ticket.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
ServicePartner.hasMany(Ticket, { foreignKey: 'assigned_partner_id' });
Ticket.belongsTo(ServicePartner, { foreignKey: 'assigned_partner_id', as: 'partner' });
ServiceEngineer.hasMany(Ticket, { foreignKey: 'assigned_engineer_id' });
Ticket.belongsTo(ServiceEngineer, { foreignKey: 'assigned_engineer_id', as: 'engineer' });
Ticket.hasMany(TicketUpdate, { foreignKey: 'ticket_id', as: 'updates' });
TicketUpdate.belongsTo(Ticket, { foreignKey: 'ticket_id' });
TicketUpdate.belongsTo(User, { foreignKey: 'updated_by', as: 'updater' });

// Service
ServicePartner.hasMany(ServiceEngineer, { foreignKey: 'partner_id', as: 'engineers' });
ServiceEngineer.belongsTo(ServicePartner, { foreignKey: 'partner_id', as: 'partner' });
ServicePartner.belongsTo(User, { foreignKey: 'user_id', as: 'account' });
ServiceEngineer.belongsTo(User, { foreignKey: 'user_id', as: 'account' });

// Notifications
User.hasMany(Notification, { foreignKey: 'user_id' });
Notification.belongsTo(User, { foreignKey: 'user_id' });

// SLA
AssetCategory.hasMany(SlaMaster, { foreignKey: 'asset_category_id' });
SlaMaster.belongsTo(AssetCategory, { foreignKey: 'asset_category_id', as: 'category' });
Ticket.hasOne(TicketSlaTracking, { foreignKey: 'ticket_id', as: 'slaTracking' });
TicketSlaTracking.belongsTo(Ticket, { foreignKey: 'ticket_id', as: 'ticket' });
TicketSlaTracking.belongsTo(SlaMaster, { foreignKey: 'sla_master_id', as: 'slaMaster' });
TicketSlaTracking.belongsTo(ServicePartner, { foreignKey: 'assigned_partner_id', as: 'partner' });
TicketSlaTracking.belongsTo(ServiceEngineer, { foreignKey: 'assigned_engineer_id', as: 'engineer' });

// Ticket Attachments
Ticket.hasMany(TicketAttachment, { foreignKey: 'ticket_id', as: 'attachments' });
TicketAttachment.belongsTo(Ticket, { foreignKey: 'ticket_id' });
TicketAttachment.belongsTo(User, { foreignKey: 'uploaded_by', as: 'uploader' });

// Ticket Work Progress
Ticket.hasMany(TicketWorkProgress, { foreignKey: 'ticket_id', as: 'workProgress' });
TicketWorkProgress.belongsTo(Ticket, { foreignKey: 'ticket_id' });
TicketWorkProgress.belongsTo(User, { foreignKey: 'updated_by', as: 'updater' });

// Ticket Parts
Ticket.hasMany(TicketPart, { foreignKey: 'ticket_id', as: 'parts' });
TicketPart.belongsTo(Ticket, { foreignKey: 'ticket_id' });

// Ticket Acknowledgement
Ticket.hasOne(TicketAcknowledgement, { foreignKey: 'ticket_id', as: 'acknowledgement' });
TicketAcknowledgement.belongsTo(Ticket, { foreignKey: 'ticket_id' });

// Ticket Escalations
Ticket.hasMany(TicketEscalation, { foreignKey: 'ticket_id', as: 'escalations' });
TicketEscalation.belongsTo(Ticket, { foreignKey: 'ticket_id' });
TicketEscalation.belongsTo(User, { foreignKey: 'escalated_to', as: 'escalatedToUser' });
TicketEscalation.belongsTo(User, { foreignKey: 'escalated_by', as: 'escalatedByUser' });

module.exports = {
  sequelize, Role, User, AssetCategory, Asset, AssetAllocation, AssetHistory, AssetLog,
  Vendor, Contract, Catalog, Inventory, AssetRequest, Approval,
  Ticket, TicketUpdate, ServicePartner, ServiceEngineer, Notification, SubMaster,
  SlaMaster, TicketSlaTracking, AgentSettings,
  TicketAttachment, TicketWorkProgress, TicketPart, TicketAcknowledgement, TicketEscalation,
  EntityAttachment,
};
