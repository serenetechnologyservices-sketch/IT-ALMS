const sequelize = require('../src/config/database');
const { DataTypes } = require('sequelize');

async function hasColumn(qi, table, column) {
  const desc = await qi.describeTable(table);
  return column in desc;
}

async function migrate() {
  const qi = sequelize.getQueryInterface();

  const newCols = {
    ticket_type: { type: DataTypes.ENUM('incident', 'service_request', 'change_request'), defaultValue: 'incident' },
    assigned_group: { type: DataTypes.STRING(100), allowNull: true },
    impact: { type: DataTypes.ENUM('low', 'medium', 'high', 'critical'), allowNull: true },
    visit_required: { type: DataTypes.BOOLEAN, defaultValue: false },
    resolution_summary: { type: DataTypes.TEXT, allowNull: true },
    action_taken: { type: DataTypes.TEXT, allowNull: true },
    downtime_start: { type: DataTypes.DATE, allowNull: true },
    downtime_end: { type: DataTypes.DATE, allowNull: true },
    downtime_duration: { type: DataTypes.DECIMAL(8, 2), allowNull: true },
    // Service Request
    request_type: { type: DataTypes.STRING(100), allowNull: true },
    requester_id: { type: DataTypes.INTEGER, allowNull: true },
    requested_for: { type: DataTypes.INTEGER, allowNull: true },
    catalog_item_id: { type: DataTypes.INTEGER, allowNull: true },
    quantity: { type: DataTypes.INTEGER, allowNull: true },
    configuration_details: { type: DataTypes.JSON, allowNull: true },
    justification: { type: DataTypes.TEXT, allowNull: true },
    approval_required: { type: DataTypes.BOOLEAN, defaultValue: false },
    approval_status: { type: DataTypes.ENUM('pending', 'approved', 'rejected', 'not_required'), defaultValue: 'not_required' },
    approved_by: { type: DataTypes.INTEGER, allowNull: true },
    approval_date: { type: DataTypes.DATE, allowNull: true },
    fulfillment_status: { type: DataTypes.STRING(50), allowNull: true },
    delivery_date: { type: DataTypes.DATEONLY, allowNull: true },
    new_asset_flag: { type: DataTypes.BOOLEAN, defaultValue: false },
    // Change Request
    change_type: { type: DataTypes.ENUM('standard', 'normal', 'emergency'), allowNull: true },
    planned_start_date: { type: DataTypes.DATE, allowNull: true },
    planned_end_date: { type: DataTypes.DATE, allowNull: true },
    actual_start_date: { type: DataTypes.DATE, allowNull: true },
    actual_end_date: { type: DataTypes.DATE, allowNull: true },
    risk_level: { type: DataTypes.ENUM('low', 'medium', 'high'), allowNull: true },
    impact_analysis: { type: DataTypes.TEXT, allowNull: true },
    rollback_plan: { type: DataTypes.TEXT, allowNull: true },
    implementation_plan: { type: DataTypes.TEXT, allowNull: true },
    testing_result: { type: DataTypes.TEXT, allowNull: true },
    affected_assets: { type: DataTypes.JSON, allowNull: true },
    affected_services: { type: DataTypes.JSON, allowNull: true },
  };

  for (const [col, def] of Object.entries(newCols)) {
    if (!(await hasColumn(qi, 'tickets', col))) {
      await qi.addColumn('tickets', col, def);
      console.log(`  Added tickets.${col}`);
    }
  }

  // Set existing tickets to incident type
  await qi.sequelize.query("UPDATE tickets SET ticket_type = 'incident' WHERE ticket_type IS NULL");

  console.log('Ticket types migration complete.');
}

migrate().then(() => process.exit(0)).catch(err => { console.error(err.message); process.exit(1); });
