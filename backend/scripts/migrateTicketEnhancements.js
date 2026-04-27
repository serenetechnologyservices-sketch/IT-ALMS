/**
 * Migration: Ticket Management Enhancements
 * Adds new columns to tickets table, extends status enum,
 * and creates new tables for attachments, work progress, parts,
 * acknowledgements, and escalations.
 * Idempotent — safe to run multiple times.
 */
const sequelize = require('../src/config/database');
const { DataTypes } = require('sequelize');

async function hasColumn(qi, table, column) {
  const desc = await qi.describeTable(table);
  return column in desc;
}

async function tableExists(qi, table) {
  try { await qi.describeTable(table); return true; } catch { return false; }
}

async function migrate() {
  const qi = sequelize.getQueryInterface();

  // ── 1. Extend tickets table with new columns ──
  const newCols = {
    title: { type: DataTypes.STRING(300), allowNull: true },
    category: { type: DataTypes.STRING(100), allowNull: true },
    subcategory: { type: DataTypes.STRING(100), allowNull: true },
    problem_type: { type: DataTypes.STRING(100), allowNull: true },
    urgency: { type: DataTypes.ENUM('low', 'medium', 'high', 'critical'), allowNull: true },
    order_number: { type: DataTypes.STRING(100), allowNull: true },
    invoice_number: { type: DataTypes.STRING(100), allowNull: true },
    complaint_reference: { type: DataTypes.STRING(100), allowNull: true },
    contract_id: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'contracts', key: 'id' } },
    region: { type: DataTypes.STRING(100), allowNull: true },
    zone: { type: DataTypes.STRING(100), allowNull: true },
    reopen_count: { type: DataTypes.INTEGER, defaultValue: 0 },
    last_updated_by: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'users', key: 'id' } },
    root_cause: { type: DataTypes.TEXT, allowNull: true },
  };
  for (const [col, def] of Object.entries(newCols)) {
    if (!(await hasColumn(qi, 'tickets', col))) {
      await qi.addColumn('tickets', col, def);
      console.log(`  Added tickets.${col}`);
    }
  }

  // Extend status enum (MySQL specific)
  try {
    await qi.changeColumn('tickets', 'status', {
      type: DataTypes.ENUM('open','assigned','in_progress','waiting','on_hold','awaiting_parts','completed','resolved','closed'),
      defaultValue: 'open',
    });
    console.log('  Extended tickets.status enum');
  } catch (e) { console.log('  tickets.status enum already extended or error:', e.message); }

  // ── 2. Add delay_reason to ticket_sla_tracking ──
  if (await tableExists(qi, 'ticket_sla_tracking') && !(await hasColumn(qi, 'ticket_sla_tracking', 'delay_reason'))) {
    await qi.addColumn('ticket_sla_tracking', 'delay_reason', { type: DataTypes.TEXT, allowNull: true });
    console.log('  Added ticket_sla_tracking.delay_reason');
  }

  // ── 3. Create ticket_attachments ──
  if (!(await tableExists(qi, 'ticket_attachments'))) {
    await qi.createTable('ticket_attachments', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      ticket_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'tickets', key: 'id' } },
      file_name: { type: DataTypes.STRING(300), allowNull: false },
      file_path: { type: DataTypes.STRING(500), allowNull: false },
      file_type: { type: DataTypes.STRING(50) },
      file_size: { type: DataTypes.INTEGER },
      uploaded_by: { type: DataTypes.INTEGER, references: { model: 'users', key: 'id' } },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    });
    console.log('  Created ticket_attachments');
  }

  // ── 4. Create ticket_work_progress ──
  if (!(await tableExists(qi, 'ticket_work_progress'))) {
    await qi.createTable('ticket_work_progress', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      ticket_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'tickets', key: 'id' } },
      work_notes: { type: DataTypes.TEXT, allowNull: true },
      customer_comments: { type: DataTypes.TEXT, allowNull: true },
      technician_name: { type: DataTypes.STRING(200), allowNull: true },
      technician_id: { type: DataTypes.STRING(100), allowNull: true },
      visit_date: { type: DataTypes.DATEONLY, allowNull: true },
      check_in_time: { type: DataTypes.DATE, allowNull: true },
      check_out_time: { type: DataTypes.DATE, allowNull: true },
      root_cause: { type: DataTypes.TEXT, allowNull: true },
      resolution_summary: { type: DataTypes.TEXT, allowNull: true },
      action_taken: { type: DataTypes.TEXT, allowNull: true },
      work_start_time: { type: DataTypes.DATE, allowNull: true },
      work_end_time: { type: DataTypes.DATE, allowNull: true },
      total_effort_hours: { type: DataTypes.DECIMAL(6, 2), allowNull: true },
      updated_by: { type: DataTypes.INTEGER, references: { model: 'users', key: 'id' } },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    });
    console.log('  Created ticket_work_progress');
  }

  // ── 5. Create ticket_parts ──
  if (!(await tableExists(qi, 'ticket_parts'))) {
    await qi.createTable('ticket_parts', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      ticket_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'tickets', key: 'id' } },
      part_name: { type: DataTypes.STRING(200), allowNull: false },
      quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
      cost: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
      status: { type: DataTypes.ENUM('used', 'pending', 'returned'), defaultValue: 'pending' },
      updated_by: { type: DataTypes.INTEGER, references: { model: 'users', key: 'id' } },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    });
    console.log('  Created ticket_parts');
  }

  // ── 6. Create ticket_acknowledgements ──
  if (!(await tableExists(qi, 'ticket_acknowledgements'))) {
    await qi.createTable('ticket_acknowledgements', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      ticket_id: { type: DataTypes.INTEGER, allowNull: false, unique: true, references: { model: 'tickets', key: 'id' } },
      signature_data: { type: DataTypes.TEXT, allowNull: true },
      feedback_rating: { type: DataTypes.INTEGER, allowNull: true },
      closure_confirmed: { type: DataTypes.BOOLEAN, defaultValue: false },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    });
    console.log('  Created ticket_acknowledgements');
  }

  // ── 7. Create ticket_escalations ──
  if (!(await tableExists(qi, 'ticket_escalations'))) {
    await qi.createTable('ticket_escalations', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      ticket_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'tickets', key: 'id' } },
      escalation_level: { type: DataTypes.INTEGER, allowNull: false },
      escalation_reason: { type: DataTypes.TEXT },
      escalated_to: { type: DataTypes.INTEGER, references: { model: 'users', key: 'id' } },
      escalated_by: { type: DataTypes.INTEGER, references: { model: 'users', key: 'id' } },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    });
    console.log('  Created ticket_escalations');
  }

  console.log('Ticket enhancement migration complete.');
}

migrate()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Migration failed:', err.message);
    process.exit(1);
  });
