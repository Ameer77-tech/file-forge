// Common production error phrases to detect beyond *Error / *Exception names
const KNOWN_PHRASES = [
  "JWT expired",
  "Token expired",
  "Permission denied",
  "Access denied",
  "Redis timeout",
  "Mongo timeout",
  "Socket hang up",
  "ECONNRESET",
  "ETIMEDOUT",
  "Connection refused",
  "Database connection lost",
  "Validation failed",
];

export function updateErrors(analysis, line) {
  if (/\b(ERROR|FATAL)\b/i.test(line)) {
    analysis.errors.total++;
  }

  if (
    line.includes("UnhandledPromiseRejection") ||
    line.includes("uncaughtException")
  ) {
    analysis.errors.uncaughtExceptions++;
  }

  if (line.trimStart().startsWith("at ")) {
    analysis.errors.stackTraceLines++;
  }

  // Match class-style error names like TypeError, MongoNetworkError, ValidationError
  const errorMatch = line.match(/\b([A-Za-z0-9_]+(?:Error|Exception))\b/g);
  if (errorMatch) {
    for (const error of errorMatch) {
      analysis._internal.errorMap.set(
        error,
        (analysis._internal.errorMap.get(error) || 0) + 1,
      );
    }
  }

  // Match common production error phrases (case-insensitive)
  for (const phrase of KNOWN_PHRASES) {
    if (line.toLowerCase().includes(phrase.toLowerCase())) {
      analysis._internal.errorMap.set(
        phrase,
        (analysis._internal.errorMap.get(phrase) || 0) + 1,
      );
    }
  }
}

export function finalizeErrors(analysis) {
  analysis.topErrors = [...analysis._internal.errorMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([error, count]) => ({
      error,
      count,
    }));
}
