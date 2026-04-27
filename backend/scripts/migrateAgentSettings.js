const sequelize = require('../src/config/database');
const { DataTypes } = require('sequelize');

async function migrate() {
  const qi = sequelize.getQueryInterface();

  await qi.createTable('agent_settings', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    // Feature toggles
    track_system_info: { type: DataTypes.BOOLEAN, defaultValue: true },
    track_software: { type: DataTypes.BOOLEAN, defaultValue: true },
    track_performance: { type: DataTypes.BOOLEAN, defaultValue: true },
    track_compliance: { type: DataTypes.BOOLEAN, defaultValue: true },
    // Intervals (in minutes)
    system_info_interval_min: { type: DataTypes.INTEGER, defaultValue: 1440 },
    software_scan_interval_min: { type: DataTypes.INTEGER, defaultValue: 1440 },
    performance_interval_min: { type: DataTypes.INTEGER, defaultValue: 5 },
    compliance_interval_min: { type: DataTypes.INTEGER, defaultValue: 720 },
    sync_interval_min: { type: DataTypes.INTEGER, defaultValue: 2 },
    // Metadata
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  });

  // Insert default row
  await qi.bulkInsert('agent_settings', [{
    track_system_info: true,
    track_software: true,
    track_performance: true,
    track_compliance: true,
    system_info_interval_min: 1440,
    software_scan_interval_min: 1440,
    performance_interval_min: 5,
    compliance_interval_min: 720,
    sync_interval_min: 2,
    created_at: new Date(),
    updated_at: new Date(),
  }]);

  console.log('agent_settings table created with defaults.');
}

migrate().then(() => process.exit(0)).catch(err => { console.error(err.message); process.exit(1); });
