export function finalizeHealth(analysis) {
  const reasons = [];
  let score = 100;

  // --- Error percentage (log-level ERROR/FATAL lines as % of all lines) ---
  if (analysis.errors.total > 0) {
    const errorRate = (analysis.errors.total / Math.max(1, analysis.statistics.lines)) * 100;
    if (errorRate > 10) {
      score -= 35;
      reasons.push(`Critical error rate: ${errorRate.toFixed(2)}% of logs are errors`);
    } else if (errorRate > 5) {
      score -= 20;
      reasons.push(`High error rate: ${errorRate.toFixed(2)}% of logs are errors`);
    } else if (errorRate > 1) {
      score -= 10;
      reasons.push(`Elevated error rate: ${errorRate.toFixed(2)}% of logs are errors`);
    } else {
      score -= Math.min(5, analysis.errors.total);
      reasons.push(`${analysis.errors.total} error lines detected`);
    }
  }

  // --- Fatal log lines ---
  const fatalCount = analysis.logLevels?.FATAL || 0;
  if (fatalCount > 0) {
    score -= Math.min(20, fatalCount * 10);
    reasons.push(`${fatalCount} FATAL log line(s) detected`);
  }

  // --- HTTP failure percentage ---
  if (analysis.requests.total > 0) {
    const failedRate =
      (analysis.requests.failed / analysis.requests.total) * 100;
    if (failedRate > 20) {
      reasons.push(`High request failure rate: ${failedRate.toFixed(2)}%`);
      score -= 20;
    } else if (failedRate > 10) {
      reasons.push(`Elevated request failure rate: ${failedRate.toFixed(2)}%`);
      score -= 15;
    } else if (failedRate > 5) {
      reasons.push(`Moderate request failure rate: ${failedRate.toFixed(2)}%`);
      score -= 10;
    } else if (failedRate > 0) {
      reasons.push(`Request failure rate: ${failedRate.toFixed(2)}%`);
      score -= 5;
    }
  }

  // --- Average latency ---
  if (analysis.requests.total > 0) {
    const avg = analysis.responseTime.average || 0;
    if (avg > 1000) {
      reasons.push(`High average response time: ${avg}ms`);
      score -= 20;
    } else if (avg > 500) {
      reasons.push(`Elevated average response time: ${avg}ms`);
      score -= 10;
    } else if (avg > 200) {
      reasons.push(`Moderate average response time: ${avg}ms`);
      score -= 5;
    }
  }

  // --- Secrets detected ---
  if (analysis.security.containsSecrets) {
    reasons.push("Secrets detected in logs");
    score -= 25;
  }

  // --- Duplicate lines ---
  if (analysis.duplicate && analysis.duplicate.duplicatePercentage > 10) {
    reasons.push(
      `High duplicate lines: ${analysis.duplicate.duplicatePercentage}%`,
    );
    score -= 10;
  }

  // --- Error streaks ---
  if (analysis._internal && analysis._internal.maxErrorStreak > 5) {
    reasons.push(
      `Consecutive error streak: ${analysis._internal.maxErrorStreak}`,
    );
    score -= 10;
  }

  if (score < 0) score = 0;
  if (score > 100) score = 100;

  analysis.health.score = Math.round(score);
  analysis.health.reasons = reasons;

  if (score >= 90) analysis.health.grade = "A";
  else if (score >= 75) analysis.health.grade = "B";
  else if (score >= 50) analysis.health.grade = "C";
  else if (score >= 25) analysis.health.grade = "D";
  else analysis.health.grade = "F";

  // severity
  if (score < 40) analysis.health.severity = "critical";
  else if (score < 60) analysis.health.severity = "major";
  else if (score < 80) analysis.health.severity = "minor";
  else analysis.health.severity = "info";
}

export default finalizeHealth;
