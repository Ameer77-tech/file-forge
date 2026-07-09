export function updateLogLevel(analysis, line) {
  const plain = line.match(/\b(INFO|WARN|WARNING|ERROR|DEBUG|TRACE|FATAL)\b/i);
  let lvlMatch = plain;

  if (!plain) {
    // Try JSON-style loggers with a level field if plain text didn't catch standard ones
    const jsonLevel = line.match(/"level"\s*[:=]\s*"?([A-Za-z]+)"?/i);
    lvlMatch = jsonLevel;
  }

  if (lvlMatch) {
    const lvl = lvlMatch[1].toUpperCase();
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
  } else if (
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
