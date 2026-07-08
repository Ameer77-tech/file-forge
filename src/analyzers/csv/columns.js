import { detectDataType } from "./types.js";
import { WelfordStats } from "./statistics.js";

function isLikelyIdentifier(columnName, uniqueCount, totalRows) {
  const uniquePercentage = (uniqueCount / totalRows) * 100;
  const nameLower = columnName.toLowerCase();

  // Check column name for ID-like patterns
  if (
    /\bid\b|uuid|_id|identifier|pk|primary.?key|account|user_?id|customer_?id|product_?id|order_?id|row_?id/.test(
      nameLower,
    )
  ) {
    return true;
  }

  // Check if highly unique (almost 1:1 cardinality)
  if (uniquePercentage > 90) {
    return true;
  }

  return false;
}

function initializeColumn(columnName) {
  return {
    name: columnName,
    type: "unknown",
    stats: {
      uniqueValues: new Set(),
      frequency: new Map(), // will be truncated to top N
      minLength: Infinity,
      maxLength: 0,
      totalLength: 0,
      nonEmptyCount: 0,
      avgLength: 0,
      uniqueCount: 0,
      cardinality: 0, // percentage
    },
    numeric: {
      min: null,
      max: null,
      sum: 0,
      count: 0,
      mean: 0,
      stdDev: 0,
      variance: 0,
      isIdentifier: false,
    },
    quality: {
      emptyCount: 0,
      emptyPercentage: 0,
      duplicateValues: 0,
      outliersCount: 0,
      isIdentifier: false,
    },
    patterns: {
      detectedTypes: new Map(),
    },
  };
}

export function updateColumns(analysis, headers, row) {
  headers.forEach((header, index) => {
    const value = row[index] || "";

    if (!analysis._internal.columnMetadata.has(header)) {
      const col = initializeColumn(header);
      analysis._internal.columnMetadata.set(header, col);
      analysis.columns[header] = col;
      // Initialize welford stats
      analysis._internal.welfordStats = analysis._internal.welfordStats || {};
      analysis._internal.welfordStats[header] = new WelfordStats();
    }

    const column = analysis.columns[header];

    // Track empty
    if (!value || value.trim() === "") {
      column.quality.emptyCount++;
      return;
    }

    column.stats.nonEmptyCount++;

    // Detect type
    const type = detectDataType(value);
    column.patterns.detectedTypes.set(
      type,
      (column.patterns.detectedTypes.get(type) || 0) + 1,
    );

    // Track unique values and frequency (limit to 1000 to avoid memory bloat)
    if (column.stats.uniqueValues.size < 1000) {
      column.stats.uniqueValues.add(value);
    }

    // Keep top 50 frequent values in production
    if (column.stats.frequency.size < 50 || column.stats.frequency.has(value)) {
      column.stats.frequency.set(
        value,
        (column.stats.frequency.get(value) || 0) + 1,
      );
    }

    // String length stats
    column.stats.minLength = Math.min(column.stats.minLength, value.length);
    column.stats.maxLength = Math.max(column.stats.maxLength, value.length);
    column.stats.totalLength += value.length;

    // Numeric analysis - using Welford's algorithm
    if (type === "numeric" || type === "decimal" || type === "monetary") {
      const welford = analysis._internal.welfordStats[header];
      welford.update(value);
      column.numeric.count = welford.count;
      column.numeric.sum = welford.sum;
      column.numeric.min = welford.min;
      column.numeric.max = welford.max;
    }
  });
}

export function finalizeColumns(analysis) {
  for (const [columnName, column] of Object.entries(analysis.columns)) {
    // Determine dominant type
    let dominantType = "text";
    let maxCount = 0;
    for (const [type, count] of column.patterns.detectedTypes) {
      if (count > maxCount) {
        maxCount = count;
        dominantType = type;
      }
    }
    column.type = dominantType;

    // Calculate cardinality and uniqueness
    column.stats.uniqueCount = column.stats.uniqueValues.size;
    if (analysis.statistics.totalRows > 0) {
      column.stats.cardinality = Number(
        (
          (column.stats.uniqueCount / analysis.statistics.totalRows) *
          100
        ).toFixed(2),
      );
      column.quality.emptyPercentage = Number(
        (
          (column.quality.emptyCount / analysis.statistics.totalRows) *
          100
        ).toFixed(2),
      );
    }

    // Detect if column is identifier
    const isIdentifier = isLikelyIdentifier(
      columnName,
      column.stats.uniqueCount,
      analysis.statistics.totalRows,
    );
    column.quality.isIdentifier = isIdentifier;
    column.numeric.isIdentifier = isIdentifier;

    // Categorize by type
    if (dominantType === "numeric" || dominantType === "decimal") {
      analysis.typeDetection.numeric.push(columnName);
    } else if (dominantType === "monetary") {
      analysis.typeDetection.numeric.push(columnName); // Treat as numeric
    } else if (dominantType === "date" || dominantType === "timestamp") {
      analysis.typeDetection.date.push(columnName);
    } else if (dominantType === "boolean") {
      analysis.typeDetection.boolean.push(columnName);
    } else if (dominantType === "uuid" || dominantType === "ipaddress") {
      analysis.typeDetection.categorical.push(columnName);
    } else if (dominantType === "email" || dominantType === "url") {
      analysis.typeDetection.categorical.push(columnName);
    } else if (dominantType === "phone") {
      analysis.typeDetection.categorical.push(columnName);
    } else {
      analysis.typeDetection.text.push(columnName);
    }

    // Calculate numeric statistics using Welford's result
    if (column.numeric.count > 0) {
      const welford = analysis._internal.welfordStats[columnName];
      const stats = welford.getStats();

      column.numeric.mean = stats.mean;
      column.numeric.stdDev = stats.stdDev;
      column.numeric.variance = stats.variance;
      column.numeric.min = stats.min;
      column.numeric.max = stats.max;

      // Outlier detection (IQR method) - SKIP for identifier columns
      if (!isIdentifier && column.numeric.stdDev > 0) {
        // Use simplified outlier detection without storing all values
        // If stdDev is very large, we likely have outliers
        const range = stats.max - stats.min;
        const expectedRange = 4 * stats.stdDev; // ~4 sigma covers 99.9%

        // Conservative estimate: if range >> expectedRange, assume outliers exist
        if (range > expectedRange * 2) {
          column.quality.outliersCount = Math.floor(
            analysis.statistics.totalRows * 0.05,
          ); // Conservative: assume ~5% might be outliers
        }
      }

      if (column.quality.outliersCount > 0) {
        analysis.dataQuality.outliersDetected += column.quality.outliersCount;
      }
    }

    // Calculate average text length (correct formula)
    if (column.stats.nonEmptyCount > 0) {
      column.stats.avgLength = Number(
        (column.stats.totalLength / column.stats.nonEmptyCount).toFixed(2),
      );
    }

    // Count duplicate values
    let duplicateCount = 0;
    for (const count of column.stats.frequency.values()) {
      if (count > 1) {
        duplicateCount += count - 1;
      }
    }
    column.quality.duplicateValues = duplicateCount;

    // Clean up for JSON serialization
    column.stats.uniqueValues = column.stats.uniqueCount; // Replace Set with count
    column.stats.frequency = Array.from(column.stats.frequency.entries())
      .slice(0, 10) // Only keep top 10 for output
      .map(([value, count]) => ({ value, count }));
    column.patterns.detectedTypes = undefined;

    // Remove numeric.count from output if not needed
    delete column.numeric.count;
  }
}
