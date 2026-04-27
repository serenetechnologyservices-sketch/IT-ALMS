const sequelize = require('../src/config/database');
const { DataTypes } = require('sequelize');

async function hasCol(qi, table, col) {
  const desc = await qi.describeTable(table);
  return col in desc;
}

async function addIfMissing(qi, table, col, def) {
  if (!(await hasCol(qi, table, col))) {
    await qi.addColumn(table, col, def);
    console.log(`  Added ${table}.${col}`);
  }
}

async function migrate() {
  const qi = sequelize.getQueryInterface();

  // Extend sla_master
  await addIfMissing(qi, 'sla_master', 'name', { type: DataTypes.STRING(200), allowNull: true });
  await addIfMissing(qi, 'sla_master', 'sla_level', { type: DataTypes.ENUM('L1', 'L2', 'L3', 'L4'), defaultValue: 'L2' });
  await addIfMissing(qi, 'sla_master', 'subcategory', { type: DataTypes.STRING(100), allowNull: true });
  await addIfMissing(qi, 'sla_master', 'vendor_id', { type: DataTypes.INTEGER, allowNull: true });
  await addIfMissing(qi, 'sla_master', 'asset_id', { type: DataTypes.INTEGER, allowNull: true });
  await addIfMissing(qi, 'sla_master', 'acknowledgement_time_hours', { type: DataTypes.DECIMAL(6, 2), allowNull: true });
  await addIfMissing(qi, 'sla_master', 'business_hours_only', { type: DataTypes.BOOLEAN, defaultValue: false });
  await addIfMissing(qi, 'sla_master', 'business_start_hour', { type: DataTypes.INTEGER, defaultValue: 9 });
  await addIfMissing(qi, 'sla_master', 'business_end_hour', { type: DataTypes.INTEGER, defaultValue: 18 });
  await addIfMissing(qi, 'sla_master', 'pause_on_statuses', { type: DataTypes.STRING(500), allowNull: true });
  await addIfMissing(qi, 'sla_master', 'start_condition', { type: DataTypes.ENUM('on_creation', 'on_assignment', 'on_in_progress'), defaultValue: 'on_assignment' });

  // Extend ticket_sla_tracking
  await addIfMissing(qi, 'ticket_sla_tracking', 'acknowledgement_due_time', { type: DataTypes.DATE, allowNull: true });
  await addIfMissing(qi, 'ticket_sla_tracking', 'acknowledgement_actual_time', { type: DataTypes.DATE, allowNull: true });
  await addIfMissing(qi, 'ticket_sla_tracking', 'acknowledgement_status', { type: DataTypes.ENUM('pending', 'met', 'breached', 'na'), defaultValue: 'na' });
  await addIfMissing(qi, 'ticket_sla_tracking', 'is_paused', { type: DataTypes.BOOLEAN, defaultValue: false });
  await addIfMissing(qi, 'ticket_sla_tracking', 'paused_at', { type: DataTypes.DATE, allowNull: true });
  await addIfMissing(qi, 'ticket_sla_tracking', 'total_paused_ms', { type: DataTypes.BIGINT, defaultValue: 0 });
  await addIfMissing(qi, 'ticket_sla_tracking', 'pause_count', { type: DataTypes.INTEGER, defaultValue: 0 });

  // Set existing rules to L2 level
  await sequelize.query("UPDATE sla_master SET sla_level = 'L2' WHERE sla_level IS NULL");

  console.log('Enhanced SLA migration complete.');
}

migrate().then(() => process.exit(0)).catch(err => { console.error(err.message); process.exit(1); });
