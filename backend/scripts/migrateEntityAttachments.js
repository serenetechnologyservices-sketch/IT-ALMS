const sequelize = require('../src/config/database');
const { DataTypes } = require('sequelize');

async function migrate() {
  const qi = sequelize.getQueryInterface();

  // Create entity_attachments table
  try {
    await qi.describeTable('entity_attachments');
    console.log('entity_attachments already exists');
  } catch {
    await qi.createTable('entity_attachments', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      entity_type: { type: DataTypes.STRING(50), allowNull: false },
      entity_id: { type: DataTypes.INTEGER, allowNull: false },
      file_name: { type: DataTypes.STRING(300), allowNull: false },
      file_path: { type: DataTypes.STRING(500), allowNull: false },
      file_type: { type: DataTypes.STRING(50) },
      file_size: { type: DataTypes.INTEGER },
      uploaded_by: { type: DataTypes.INTEGER, references: { model: 'users', key: 'id' } },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    });
    await qi.addIndex('entity_attachments', ['entity_type', 'entity_id']);
    console.log('entity_attachments created');
  }

  // Add remarks to asset_allocations
  try {
    const desc = await qi.describeTable('asset_allocations');
    if (!desc.remarks) {
      await qi.addColumn('asset_allocations', 'remarks', { type: DataTypes.TEXT, allowNull: true });
      console.log('Added remarks to asset_allocations');
    }
  } catch (e) { console.log('remarks column error:', e.message); }

  console.log('Entity attachments migration complete.');
}

migrate().then(() => process.exit(0)).catch(err => { console.error(err.message); process.exit(1); });
