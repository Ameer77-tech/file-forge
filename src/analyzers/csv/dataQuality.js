export function finalizeDataQuality(analysis) {
  // Calculate quality score (0-100) based on multiple factors
  let qualityScore = 100;

  // 1. Deduct for missing data (30% weight)
  const missingPercentage = 100 - analysis.dataQuality.completeness;
  qualityScore -= missingPercentage * 0.3;

  // 2. Deduct for duplicates (20% weight)
  qualityScore -= Math.min(analysis.dataQuality.duplicatePercentage * 0.2, 20);

  // 3. Deduct for outliers (15% weight) - but only if not all columns are identifiers
  if (analysis.statistics.totalRows > 0) {
    const outlierPercentage = (
      (analysis.dataQuality.outliersDetected / analysis.statistics.totalRows) *
      100
    ).toFixed(2);
    qualityScore -= Math.min(outlierPercentage * 0.15, 15);
  }

  // 4. Bonus for complete data
  if (analysis.dataQuality.completeness === 100) {
    qualityScore = Math.min(qualityScore + 5, 100);
  }

  analysis.dataQuality.qualityScore = Math.max(
    0,
    Number(qualityScore.toFixed(2)),
  );
}
