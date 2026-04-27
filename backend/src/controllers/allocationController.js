const { Asset, AssetAllocation, AssetHistory, User } = require('../models');

exports.allocate = async (req, res, next) => {
  try {
    const { asset_id, user_id, location, remarks } = req.body;
    const asset = await Asset.findByPk(asset_id);
    if (!asset) return res.status(404).json({ success: false, error: 'Asset not found.' });
    if (asset.status !== 'available') return res.status(400).json({ success: false, error: 'Asset is not available for allocation.' });

    const user = await User.findByPk(user_id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found.' });

    await asset.update({ status: 'allocated' });
    const allocation = await AssetAllocation.create({
      asset_id, user_id, allocated_by: req.user.id,
      allocation_date: new Date().toISOString().split('T')[0], location, remarks, status: 'active',
    });
    await AssetHistory.create({
      asset_id, event_type: 'allocated',
      description: `Allocated to ${user.full_name} at ${location || 'N/A'}`,
      performed_by: req.user.id,
    });
    res.status(201).json({ success: true, data: allocation });
  } catch (err) { next(err); }
};

exports.transfer = async (req, res, next) => {
  try {
    const { asset_id, new_user_id, new_location, remarks } = req.body;
    const asset = await Asset.findByPk(asset_id);
    if (!asset) return res.status(404).json({ success: false, error: 'Asset not found.' });
    if (asset.status !== 'allocated') return res.status(400).json({ success: false, error: 'Asset is not currently allocated.' });

    const activeAlloc = await AssetAllocation.findOne({ where: { asset_id, status: 'active' } });
    if (activeAlloc) await activeAlloc.update({ status: 'transferred', return_date: new Date().toISOString().split('T')[0] });

    const newUser = await User.findByPk(new_user_id);
    const allocation = await AssetAllocation.create({
      asset_id, user_id: new_user_id, allocated_by: req.user.id,
      allocation_date: new Date().toISOString().split('T')[0], location: new_location, remarks, status: 'active',
    });
    await AssetHistory.create({
      asset_id, event_type: 'transferred',
      description: `Transferred to ${newUser?.full_name || new_user_id} at ${new_location || 'N/A'}`,
      performed_by: req.user.id,
    });
    res.json({ success: true, data: allocation });
  } catch (err) { next(err); }
};

exports.returnAsset = async (req, res, next) => {
  try {
    const { asset_id, remarks } = req.body;
    const asset = await Asset.findByPk(asset_id);
    if (!asset) return res.status(404).json({ success: false, error: 'Asset not found.' });
    if (asset.status !== 'allocated') return res.status(400).json({ success: false, error: 'Asset is not currently allocated.' });

    const activeAlloc = await AssetAllocation.findOne({ where: { asset_id, status: 'active' } });
    if (activeAlloc) await activeAlloc.update({ status: 'returned', return_date: new Date().toISOString().split('T')[0], remarks: remarks || activeAlloc.remarks });

    await asset.update({ status: 'available' });
    await AssetHistory.create({
      asset_id, event_type: 'returned', description: `Asset returned${remarks ? ': ' + remarks : ''}`, performed_by: req.user.id,
    });
    res.json({ success: true, message: 'Asset returned successfully.' });
  } catch (err) { next(err); }
};

exports.scrap = async (req, res, next) => {
  try {
    const { asset_id, remarks } = req.body;
    const asset = await Asset.findByPk(asset_id);
    if (!asset) return res.status(404).json({ success: false, error: 'Asset not found.' });

    const activeAlloc = await AssetAllocation.findOne({ where: { asset_id, status: 'active' } });
    if (activeAlloc) {
      await activeAlloc.update({ status: 'scrapped', return_date: new Date().toISOString().split('T')[0], remarks: remarks || activeAlloc.remarks });
    } else {
      // Create a scrap record even if no active allocation exists
      await AssetAllocation.create({
        asset_id, user_id: req.user.id, allocated_by: req.user.id,
        allocation_date: new Date().toISOString().split('T')[0],
        return_date: new Date().toISOString().split('T')[0],
        status: 'scrapped', remarks,
      });
    }

    await asset.update({ status: 'scrap' });
    await AssetHistory.create({
      asset_id, event_type: 'scrapped', description: `Asset scrapped${remarks ? ': ' + remarks : ''}`, performed_by: req.user.id,
    });
    res.json({ success: true, message: 'Asset scrapped successfully.' });
  } catch (err) { next(err); }
};

exports.list = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const where = {};
    if (status) where.status = status;
    const offset = (page - 1) * limit;
    const { count, rows } = await AssetAllocation.findAndCountAll({
      where, offset, limit: +limit, order: [['id', 'DESC']],
      include: [
        { model: Asset, as: 'asset', attributes: ['id', 'name', 'serial_number', 'status'] },
        { model: User, as: 'user', attributes: ['id', 'full_name'] },
        { model: User, as: 'allocator', attributes: ['id', 'full_name'] },
      ],
    });
    res.json({ success: true, data: rows, pagination: { total: count, page: +page, limit: +limit } });
  } catch (err) { next(err); }
};
