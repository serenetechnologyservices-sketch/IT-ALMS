/**
 * Compute straight-line depreciation and current value.
 * @param {number} purchaseCost
 * @param {number} salvageValue
 * @param {number} usefulLifeYears
 * @param {number} yearsSincePurchase
 * @returns {{ annualDepreciation: number, currentValue: number }}
 */
function computeDepreciation(purchaseCost, salvageValue, usefulLifeYears, yearsSincePurchase) {
  const cost = purchaseCost || 0;
  const salvage = salvageValue || 0;
  const life = usefulLifeYears || 5;

  const annualDepreciation = life > 0 ? (cost - salvage) / life : 0;
  const currentValue = Math.max(0, cost - (annualDepreciation * yearsSincePurchase));

  return {
    annualDepreciation: Math.round(annualDepreciation * 100) / 100,
    currentValue: Math.round(currentValue * 100) / 100,
  };
}

module.exports = { computeDepreciation };
