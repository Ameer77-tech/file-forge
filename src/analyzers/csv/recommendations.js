export function finalizeRecommendations(analysis) {
  const recs = [];

  // Completeness
  if (analysis.dataQuality.completeness < 95) {
    const missingPercentage = (100 - analysis.dataQuality.completeness).toFixed(
      2,
    );
    recs.push(
      `Data completeness is ${analysis.dataQuality.completeness}%. Found ${analysis.statistics.emptyCells} empty cells (${missingPercentage}%). Consider data imputation or removal of sparse columns.`,
    );
  }

  // Duplicates
  if (analysis.dataQuality.duplicatePercentage > 5) {
    recs.push(
      `Detected ${analysis.dataQuality.duplicateRows} duplicate rows (${analysis.dataQuality.duplicatePercentage}%). Verify if these are intentional or investigate root cause.`,
    );
  }

  // Outliers (but skip if they're all identifier columns)
  if (analysis.dataQuality.outliersDetected > 0) {
    const outlierPercentage = (
      (analysis.dataQuality.outliersDetected / analysis.statistics.totalRows) *
      100
    ).toFixed(2);
    if (outlierPercentage > 1) {
      recs.push(
        `Found ~${analysis.dataQuality.outliersDetected} outliers (${outlierPercentage}%) in numeric columns. Verify these are valid data points.`,
      );
    }
  }

  // Sensitive data
  const sensitiveData = analysis.detections.emails + analysis.detections.uuids;
  if (sensitiveData > 0) {
    const parts = [];
    if (analysis.detections.emails > 0)
      parts.push(`${analysis.detections.emails} email(s)`);
    if (analysis.detections.uuids > 0)
      parts.push(`${analysis.detections.uuids} UUID(s)`);
    recs.push(
      `Contains ${parts.join(" and ")} — ensure proper data anonymization and protection.`,
    );
  }

  // Column-level recommendations
  for (const [colName, column] of Object.entries(analysis.columns)) {
    // Skip identifier columns
    if (column.quality.isIdentifier) continue;

    if (column.quality.emptyPercentage > 20) {
      recs.push(
        `Column "${colName}" has ${column.quality.emptyPercentage}% empty values. Consider dropping or filling with meaningful data.`,
      );
    }

    if (column.numeric.stdDev === 0 && column.numeric.count > 0) {
      recs.push(
        `Column "${colName}" is constant (all values identical). Consider removing it.`,
      );
    }

    if (
      column.type === "text" &&
      column.stats.cardinality < 5 &&
      column.stats.uniqueCount > 0
    ) {
      recs.push(
        `Column "${colName}" appears to be categorical (${column.stats.uniqueCount} unique values). Consider encoding as enum.`,
      );
    }
  }

  // Overall quality assessment
  if (analysis.dataQuality.qualityScore < 60) {
    recs.push(
      `Overall data quality is poor (${analysis.dataQuality.qualityScore}/100). Significant data cleaning required.`,
    );
  } else if (analysis.dataQuality.qualityScore < 80) {
    recs.push(
      `Overall data quality needs improvement (${analysis.dataQuality.qualityScore}/100). Address missing values and duplicates.`,
    );
  } else {
    recs.push(
      `Data quality is good (${analysis.dataQuality.qualityScore}/100). Only minor improvements recommended.`,
    );
  }

  analysis.recommendations =
    recs.length > 0
      ? recs
      : ["No immediate recommendations — CSV looks clean."];
}
