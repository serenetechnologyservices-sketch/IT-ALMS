const { Asset, AssetCategory, Vendor } = require('../models');

exports.scan = async (req, res, next) => {
  try {
    const { code } = req.params;
    const asset = await Asset.findOne({
      where: { qr_code: code },
      include: [
        { model: AssetCategory, as: 'category', attributes: ['id', 'name'] },
        { model: Vendor, as: 'vendor', attributes: ['id', 'name'] },
      ],
    });
    if (!asset) return res.status(404).json({ success: false, error: 'No asset found for this QR code.' });
    res.json({ success: true, data: asset });
  } catch (err) { next(err); }
};
