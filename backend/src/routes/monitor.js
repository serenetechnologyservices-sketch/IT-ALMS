const router = require('express').Router();
const roleGuard = require('../middleware/roleGuard');
const { sequelize, Asset, Ticket, User, AssetAllocation, TicketSlaTracking } = require('../models');
const os = require('os');

// System usage monitoring — Admin/CIO only
router.get('/system', roleGuard('Admin', 'CIO'), async (req, res, next) => {
  try {
    const uptime = process.uptime();
    const mem = process.memoryUsage();
    const cpus = os.cpus();

    res.json({
      success: true,
      data: {
        server: {
          uptime_seconds: Math.round(uptime),
          uptime_human: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`,
          node_version: process.version,
          platform: os.platform(),
          hostname: os.hostname(),
        },
        memory: {
          rss_mb: Math.round(mem.rss / 1048576),
          heap_used_mb: Math.round(mem.heapUsed / 1048576),
          heap_total_mb: Math.round(mem.heapTotal / 1048576),
          system_total_mb: Math.round(os.totalmem() / 1048576),
          system_free_mb: Math.round(os.freemem() / 1048576),
          system_used_pct: Math.round(((os.totalmem() - os.freemem()) / os.totalmem()) * 100),
        },
        cpu: {
          cores: cpus.length,
          model: cpus[0]?.model,
          load_avg: os.loadavg().map(l => Math.round(l * 100) / 100),
        },
      },
    });
  } catch (err) { next(err); }
});

// Database stats
router.get('/database', roleGuard('Admin', 'CIO'), async (req, res, next) => {
  try {
    const [totalAssets, totalTickets, totalUsers, activeAllocations, pendingSla] = await Promise.all([
      Asset.count(),
      Ticket.count(),
      User.count({ where: { status: 'active' } }),
      AssetAllocation.count({ where: { status: 'active' } }),
      TicketSlaTracking.count({ where: { resolution_status: 'pending' } }),
    ]);

    // DB connection test
    const dbStart = Date.now();
    await sequelize.query('SELECT 1');
    const dbLatency = Date.now() - dbStart;

    res.json({
      success: true,
      data: {
        counts: { assets: totalAssets, tickets: totalTickets, users: totalUsers, active_allocations: activeAllocations, pending_sla: pendingSla },
        database: { latency_ms: dbLatency, dialect: sequelize.getDialect(), status: 'connected' },
      },
    });
  } catch (err) { next(err); }
});

// API request stats (simple in-memory counter)
const stats = { requests: 0, errors: 0, started: new Date() };
router.getStats = () => stats;

router.get('/api-stats', roleGuard('Admin'), (req, res) => {
  res.json({
    success: true,
    data: {
      total_requests: stats.requests,
      total_errors: stats.errors,
      error_rate_pct: stats.requests > 0 ? Math.round((stats.errors / stats.requests) * 100) : 0,
      since: stats.started,
    },
  });
});

module.exports = router;
