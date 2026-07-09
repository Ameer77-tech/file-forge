import path from "path";

export function createCsvAnalysis(fileData) {
  return {
    streaming: true,
    memoryEfficient: true,
    analyzerVersion: "2.0.0", // Incremented for major improvements

    file: {
      name: fileData.originalName,
      extension: path.extname(fileData.filename),
      size: fileData.size,
    },

    statistics: {
      totalRows: 0,
      totalColumns: 0,
      headerRow: [],
      emptyRows: 0,
      totalCells: 0,
      emptyCells: 0,
      totalNumericColumns: 0,
      totalTextColumns: 0,
      totalDateColumns: 0,
      totalBooleanColumns: 0,
      totalUniqueValuesAcrossDataset: 0,
    },

    validation: {
      headerPresent: true,
      delimiterUsed: ",", // We'll assume comma for now as csv-parse handles it automatically
      malformedRows: 0,
      inconsistentColumns: 0,
      emptyColumns: 0,
    },

    columns: {},

    dataQuality: {
      completeness: 0, // % of non-empty cells
      duplicateRows: 0,
      duplicatePercentage: 0,
      outliersDetected: 0,
      qualityScore: 0, // 0-100
    },

    // Pattern detection across entire dataset
    detections: {
      emails: 0,
      urls: 0,
      phoneNumbers: 0,
      ipv4: 0,
      ipv6: 0,
      uuids: 0,
      monetaryValues: 0,
      dates: 0,
      timestamps: 0,
      panCards: 0,
      aadhaar: 0,
      creditCards: 0,
      addresses: 0,
    },

    // Automatic type categorization
    typeDetection: {
      numeric: [],
      text: [],
      date: [],
      categorical: [],
      boolean: [],
    },

    // Actionable insights
    recommendations: [],

    // Internal tracking (will be deleted before returning)
    _internal: {
      rowHashes: new Map(),
      numericColumns: {},
      textColumns: {},
      columnMetadata: new Map(),
      welfordStats: {}, // For incremental variance calculation
    },
  };
}
