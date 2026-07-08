export function finalizeHealth(analysis) {
  const reasons = [];
  let score = 100;

  // errors
  if (analysis.errors.total > 0) {
    reasons.push(`${analysis.errors.total} error lines detected`);
    score -= Math.min(50, analysis.errors.total * 2);
  }

  // slow responses
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

  // failed requests
  if (analysis.requests.total > 0) {
    const failedRate =
      (analysis.requests.failed / analysis.requests.total) * 100;
    if (failedRate > 20) {
      reasons.push(`High request failure rate: ${failedRate.toFixed(2)}%`);
      score -= 20;
    } else if (failedRate > 5) {
      reasons.push(`Elevated request failure rate: ${failedRate.toFixed(2)}%`);
      score -= 10;
    }
  }

  if (analysis.security.containsSecrets) {
    reasons.push("Secrets detected in logs");
    score -= 25;
  }

  if (analysis.duplicate && analysis.duplicate.duplicatePercentage > 10) {
    reasons.push(
      `High duplicate lines: ${analysis.duplicate.duplicatePercentage}%`,
    );
    score -= 10;
  }

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
