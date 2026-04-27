const { Catalog, Inventory, AssetCategory } = require('../models');

exports.list = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, category_id } = req.query;
    const where = {};
    if (category_id) where.category_id = category_id;
    const offset = (page - 1) * limit;
    const { count, rows } = await Catalog.findAndCountAll({
      where, offset, limit: +limit, order: [['name', 'ASC']],
      include: [
        { model: AssetCategory, as: 'category', attributes: ['id', 'name'] },
        { model: Inventory, as: 'inventory' },
      ],
    });
    const data = rows.map(item => {
      const inv = item.inventory;
      const avail = inv?.available || 0;
      let stock_status = 'available';
      if (avail === 0) stock_status = 'out_of_stock';
      else if (avail <= 3) stock_status = 'limited';
      return { ...item.toJSON(), stock_status };
    });
    res.json({ success: true, data, pagination: { total: count, page: +page, limit: +limit } });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { name, description, category_id, image_url, available = 0 } = req.body;
    const item = await Catalog.create({ name, description, category_id, image_url });
    await Inventory.create({ catalog_id: item.id, available });
    const result = await Catalog.findByPk(item.id, { include: [{ model: Inventory, as: 'inventory' }] });
    res.status(201).json({ success: true, data: result });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const item = await Catalog.findByPk(req.params.id);
    if (!item) return res.status(404).json({ success: false, error: 'Catalog item not found.' });
    await item.update(req.body);
    if (req.body.available !== undefined || req.body.allocated !== undefined || req.body.reserved !== undefined || req.body.scrap !== undefined) {
      const inv = await Inventory.findOne({ where: { catalog_id: item.id } });
      if (inv) await inv.update(req.body);
    }
    res.json({ success: true, data: item });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const item = await Catalog.findByPk(req.params.id);
    if (!item) return res.status(404).json({ success: false, error: 'Catalog item not found.' });
    await Inventory.destroy({ where: { catalog_id: item.id } });
    await item.destroy();
    res.json({ success: true, message: 'Catalog item deleted.' });
  } catch (err) { next(err); }
};
