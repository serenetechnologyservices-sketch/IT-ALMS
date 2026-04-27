/**
 * Calculate total effort in hours between two timestamps.
 * @param {Date|string} startTime
 * @param {Date|string} endTime
 * @returns {number|null} Hours rounded to 2 decimal places, or null if invalid
 */
function calculateEffortHours(startTime, endTime) {
  if (!startTime || !endTime) return null;
  const start = new Date(startTime);
  const end = new Date(endTime);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;
  if (end <= start) return null;
  const diffMs = end.getTime() - start.getTime();
  return Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
}

module.exports = { calculateEffortHours };
