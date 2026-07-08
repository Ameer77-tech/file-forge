export function updateErrors(analysis, line) {
  if (/\b(ERROR|FATAL)\b/.test(line)) {
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

  const knownErrors = [
    "TypeError",
    "ReferenceError",
    "SyntaxError",
    "RangeError",
    "MongoServerError",
    "ValidationError",
  ];

  for (const error of knownErrors) {
    if (line.includes(error)) {
      analysis._internal.errorMap.set(
        error,
        (analysis._internal.errorMap.get(error) || 0) + 1,
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
