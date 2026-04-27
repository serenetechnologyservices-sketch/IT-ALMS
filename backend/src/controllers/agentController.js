const jwt = require('jsonwebtoken');
const { Asset, AssetLog } = require('../models');

// Register agent — maps agent_id to an asset, returns a JWT token
exports.register = async (req, res, next) => {
  try {
    const { agent_id, hostname, os } = req.body;
    if (!agent_id) return res.status(400).json({ success: false, error: 'agent_id is required.' });

    const asset = await Asset.findOne({ where: { agent_id } });
    if (!asset) return res.status(404).json({ success: false, error: `No asset found with agent_id "${agent_id}". Create the asset first and use the generated Agent ID.` });

    // Generate a token for the agent with asset_id embedded
    const token = jwt.sign({ asset_id: asset.id, agent_id, hostname, role: 'Agent' }, process.env.JWT_SECRET, { expiresIn: '365d' });
    res.json({ success: true, token, asset_id: asset.id });
  } catch (err) { next(err); }
};

// Resolve asset_id from either req.body.asset_id or the agent token
const resolveAssetId = (req) => {
  if (req.body.asset_id) return req.body.asset_id;
  if (req.user?.asset_id) return req.user.asset_id;
  return null;
};

const pushData = (logType) => async (req, res, next) => {
  try {
    const asset_id = resolveAssetId(req);
    const { data } = req.body;
    if (!asset_id || !data) return res.status(400).json({ success: false, error: 'asset_id and data are required.' });
    const asset = await Asset.findByPk(asset_id);
    if (!asset) return res.status(404).json({ success: false, error: 'Asset not found.' });
    const log = await AssetLog.create({ asset_id, log_type: logType, data });
    res.status(201).json({ success: true, data: log });
  } catch (err) { next(err); }
};

exports.pushSoftware = pushData('software');
exports.pushUsage = pushData('usage');
exports.pushLogs = pushData('error');

exports.getLogs = async (req, res, next) => {
  try {
    const { asset_id, log_type } = req.query;
    const where = {};
    if (asset_id) where.asset_id = asset_id;
    if (log_type) where.log_type = log_type;
    const logs = await AssetLog.findAll({ where, order: [['created_at', 'DESC']], limit: 100 });
    res.json({ success: true, data: logs });
  } catch (err) { next(err); }
};
