/**
 * Compute health score (0-100) for an asset.
 * @param {object} params
 * @param {number} params.ageYears - Age of asset in years
 * @param {number} params.usefulLifeYears - Useful life in years
 * @param {number} params.openTicketCount - Number of open tickets
 * @param {number} params.maintenanceCost - Cumulative maintenance cost
 * @param {number} params.purchaseCost - Original purchase cost
 * @param {boolean} params.hasRecentUsage - Whether asset has recent usage data
 * @returns {number} Health score 0-100
 */
function computeHealthScore({ ageYears, usefulLifeYears, openTicketCount, maintenanceCost, purchaseCost, hasRecentUsage }) {
  const life = usefulLifeYears || 5;
  const cost = purchaseCost || 1;

  const ageScore = Math.max(0, 100 - (ageYears / life) * 40);
  const issueScore = Math.max(0, 30 - (openTicketCount * 5));
  const maintScore = Math.max(0, 20 - (maintenanceCost / cost) * 20);
  const usageScore = hasRecentUsage ? 10 : 5;

  return Math.min(100, Math.max(0, Math.round(ageScore + issueScore + maintScore + usageScore)));
}

module.exports = { computeHealthScore };
