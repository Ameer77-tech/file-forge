export function updateLogLevel(analysis, line) {
  // Try common plain text levels
  const plain = line.match(/\b(INFO|WARN|WARNING|ERROR|DEBUG|TRACE|FATAL)\b/i);

  if (plain) {
    const lvl = plain[1].toUpperCase();
    if (lvl === "WARNING") analysis.logLevels.WARN++;
    else if (analysis.logLevels[lvl] !== undefined) analysis.logLevels[lvl]++;
    else analysis.logLevels.UNKNOWN++;
    // reset or increment streaks
    if (lvl === "ERROR" || lvl === "FATAL") {
      analysis._internal.currentErrorStreak++;
      if (
        analysis._internal.currentErrorStreak >
        analysis._internal.maxErrorStreak
      ) {
        analysis._internal.maxErrorStreak =
          analysis._internal.currentErrorStreak;
      }
    } else {
      analysis._internal.currentErrorStreak = 0;
    }
    return;
  }

  // Try JSON-style loggers with a level field
  const jsonLevel = line.match(/"level"\s*[:=]\s*"?(\w+)"?/i);
  if (jsonLevel) {
    const lvl = jsonLevel[1].toUpperCase();
    if (lvl === "WARNING") analysis.logLevels.WARN++;
    else if (analysis.logLevels[lvl] !== undefined) analysis.logLevels[lvl]++;
    else analysis.logLevels.UNKNOWN++;

    if (lvl === "ERROR" || lvl === "FATAL") {
      analysis._internal.currentErrorStreak++;
      if (
        analysis._internal.currentErrorStreak >
        analysis._internal.maxErrorStreak
      ) {
        analysis._internal.maxErrorStreak =
          analysis._internal.currentErrorStreak;
      }
    } else {
      analysis._internal.currentErrorStreak = 0;
    }
    return;
  }

  // If nothing matched, increment UNKNOWN if the line looks like a log line (has a timestamp or level-like token)
  if (
    /\[?\d{4}-\d{2}-\d{2}T?\d{2}:\d{2}:\d{2}/.test(line) ||
    /level[:=]/i.test(line)
  ) {
    analysis.logLevels.UNKNOWN++;
  }
}

export function finalizeLogLevels(analysis) {
  // nothing to finalize for now, but keep API consistent
}

export default { updateLogLevel, finalizeLogLevels };
