const { AgentSettings } = require('../models');

// GET settings (returns single row — there's only one config)
exports.get = async (req, res, next) => {
  try {
    let settings = await AgentSettings.findOne();
    if (!settings) {
      settings = await AgentSettings.create({});
    }
    res.json({ success: true, data: settings });
  } catch (err) { next(err); }
};

// PUT update settings
exports.update = async (req, res, next) => {
  try {
    let settings = await AgentSettings.findOne();
    if (!settings) {
      settings = await AgentSettings.create({});
    }
    const {
      track_system_info, track_software, track_performance, track_compliance,
      system_info_interval_min, software_scan_interval_min,
      performance_interval_min, compliance_interval_min, sync_interval_min,
    } = req.body;

    await settings.update({
      track_system_info, track_software, track_performance, track_compliance,
      system_info_interval_min, software_scan_interval_min,
      performance_interval_min, compliance_interval_min, sync_interval_min,
    });

    res.json({ success: true, data: settings });
  } catch (err) { next(err); }
};

// GET for agent (public-ish endpoint the Go agent calls to fetch its config)
// Returns a simplified JSON the agent can parse
exports.getForAgent = async (req, res, next) => {
  try {
    let settings = await AgentSettings.findOne();
    if (!settings) {
      settings = await AgentSettings.create({});
    }
    res.json({
      success: true,
      data: {
        features: {
          system_info: settings.track_system_info,
          software: settings.track_software,
          performance: settings.track_performance,
          compliance: settings.track_compliance,
        },
        intervals: {
          system_info_minutes: settings.system_info_interval_min,
          software_minutes: settings.software_scan_interval_min,
          performance_minutes: settings.performance_interval_min,
          compliance_minutes: settings.compliance_interval_min,
          sync_minutes: settings.sync_interval_min,
        },
      },
    });
  } catch (err) { next(err); }
};
