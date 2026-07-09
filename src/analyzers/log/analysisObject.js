import path from "path";

export function createAnalysis(fileData) {
  return {
    streaming: true,
    memoryEfficient: true,
    bytesProcessed: 0,
    analyzerVersion: "1.0.0",

    file: {
      name: fileData.originalName,
      extension: path.extname(fileData.filename),
      size: fileData.size,
    },

    recentEvents: [],

    statistics: {
      lines: 0,
      emptyLines: 0,
      characters: 0,
      averageLineLength: 0,
    },

    timeline: {
      firstLog: null,
      lastLog: null,
      duration: null,
    },

    logLevels: {
      INFO: 0,
      WARN: 0,
      ERROR: 0,
      DEBUG: 0,
      TRACE: 0,
      FATAL: 0,
      UNKNOWN: 0,
    },

    requests: {
      total: 0,
      successful: 0,
      failed: 0,
      successRate: 0,
    },

    httpMethods: {
      GET: 0,
      POST: 0,
      PUT: 0,
      PATCH: 0,
      DELETE: 0,
    },

    statusCodes: new Map(),

    responseTime: {
      min: null,
      max: null,
      average: 0,
      over100ms: 0,
      over500ms: 0,
      over1000ms: 0,
    },

    detections: {
      emails: 0,
      urls: 0,
      ipv4: 0,
      ipv6: 0,
      phoneNumbers: 0,
      uuids: 0,
      jwtTokens: 0,
      bearerTokens: 0,
      apiKeys: 0,
      awsKeys: 0,
      mongodbIds: 0,
    },

    errors: {
      total: 0,
      uncaughtExceptions: 0,
      stackTraceLines: 0,
    },

    longestLine: {
      length: 0,
      content: "",
    },

    topEndpoints: [],

    topIPs: [],

    topErrors: [],

    hourlyTraffic: {},

    security: {
      containsSecrets: false,
    },

    health: {
      score: 100,
      grade: "A",
    },

    recommendations: [],
    _internal: {
      endpointMap: new Map(),
      ipMap: new Map(),
      errorMap: new Map(),
      endpointStats: new Map(),
      totalResponseTime: 0,
      responseTimeCount: 0,
      responseTimeSamples: [],
      maxResponseSamples: 5000,
      duplicateWindow: 10000,
      duplicateMap: new Map(),
      duplicateQueue: [],
      bytesProcessed: 0,
      currentErrorStreak: 0,
      maxErrorStreak: 0,
    },
  };
}
