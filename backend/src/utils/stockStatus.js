/**
 * Determine stock status from available quantity.
 * @param {number} available
 * @param {number} threshold - "limited" threshold, default 3
 * @returns {'available'|'limited'|'out_of_stock'}
 */
function getStockStatus(available, threshold = 3) {
  if (available <= 0) return 'out_of_stock';
  if (available <= threshold) return 'limited';
  return 'available';
}

module.exports = { getStockStatus };
