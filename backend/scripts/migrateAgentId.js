const sequelize = require('../src/config/database');
const { DataTypes } = require('sequelize');

async function migrate() {
  const qi = sequelize.getQueryInterface();
  const desc = await qi.describeTable('assets');
  if (!desc.agent_id) {
    await qi.addColumn('assets', 'agent_id', { type: DataTypes.STRING(100), unique: true, allowNull: true });
    console.log('Added agent_id column to assets');
  } else {
    console.log('agent_id already exists');
  }

  // Backfill existing assets with agent IDs
  const [assets] = await sequelize.query('SELECT id FROM assets WHERE agent_id IS NULL');
  for (const a of assets) {
    const agentId = 'AGT-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    await sequelize.query('UPDATE assets SET agent_id = ? WHERE id = ?', { replacements: [agentId, a.id] });
  }
  console.log('Backfilled', assets.length, 'assets with agent IDs');
}

migrate().then(() => process.exit(0)).catch(err => { console.error(err.message); process.exit(1); });
