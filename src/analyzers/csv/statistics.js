/**
 * Welford's online algorithm for computing variance incrementally
 * without storing all values
 */
export class WelfordStats {
  constructor() {
    this.count = 0;
    this.mean = 0;
    this.M2 = 0; // for variance calculation
    this.min = null;
    this.max = null;
    this.sum = 0;
  }

  update(value) {
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(num)) return;

    this.count++;
    this.sum += num;

    // Track min/max
    if (this.min === null || num < this.min) this.min = num;
    if (this.max === null || num > this.max) this.max = num;

    // Welford's algorithm for mean and variance
    const delta = num - this.mean;
    this.mean += delta / this.count;
    const delta2 = num - this.mean;
    this.M2 += delta * delta2;
  }

  getVariance() {
    return this.count < 2 ? 0 : this.M2 / this.count;
  }

  getStdDev() {
    return Math.sqrt(this.getVariance());
  }

  getMean() {
    return this.count === 0 ? 0 : this.mean;
  }

  getStats() {
    return {
      count: this.count,
      sum: this.sum,
      min: this.min,
      max: this.max,
      mean: Number(this.getMean().toFixed(4)),
      stdDev: Number(this.getStdDev().toFixed(4)),
      variance: Number(this.getVariance().toFixed(4)),
    };
  }
}

export function updateStatistics(analysis, row) {
  const isEmpty = row.every((cell) => !cell || cell.trim() === "");

  if (isEmpty) {
    analysis.statistics.emptyRows++;
    return;
  }

  analysis.statistics.totalRows++;

  row.forEach((cell) => {
    analysis.statistics.totalCells++;
    if (!cell || cell.trim() === "") {
      analysis.statistics.emptyCells++;
    }
  });
}

export function finalizeStatistics(analysis) {
  if (analysis.statistics.totalCells > 0) {
    analysis.dataQuality.completeness = Number(
      (
        ((analysis.statistics.totalCells - analysis.statistics.emptyCells) /
          analysis.statistics.totalCells) *
        100
      ).toFixed(2),
    );
  }
}
