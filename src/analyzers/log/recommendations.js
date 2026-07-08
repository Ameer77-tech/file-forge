export function finalizeRecommendations(analysis) {
  const recs = [];

  if (analysis.security.containsSecrets) {
    const parts = [];
    if (analysis.detections.jwtTokens)
      parts.push(`${analysis.detections.jwtTokens} JWT(s)`);
    if (analysis.detections.bearerTokens)
      parts.push(`${analysis.detections.bearerTokens} Bearer token(s)`);
    if (analysis.detections.apiKeys)
      parts.push(`${analysis.detections.apiKeys} API key(s)`);
    if (analysis.detections.awsKeys)
      parts.push(`${analysis.detections.awsKeys} AWS key(s)`);
    recs.push(
      `Secrets detected (${parts.join(", ")}). Remove them and rotate credentials.`,
    );
  }

  if (analysis.errors.total > 0) {
    const top = (analysis.topErrors || [])
      .slice(0, 3)
      .map((e) => `${e.error} (${e.count})`)
      .join(", ");
    recs.push(
      `Found ${analysis.errors.total} error lines. Top errors: ${top || "(none)"}.`,
    );
    if (analysis.errors.stackTraceLines > 0)
      recs.push("Investigate stack traces to pinpoint root causes.");
  }

  if (analysis.slowestEndpoint) {
    recs.push(
      `Slowest endpoint: ${analysis.slowestEndpoint.endpoint} — avg ${Math.round(analysis.slowestEndpoint.averageResponseTime)}ms over ${analysis.slowestEndpoint.count} requests.`,
    );
  }

  if (analysis.mostErrorProneEndpoint) {
    const rate = analysis.mostErrorProneEndpoint.count
      ? (
          (analysis.mostErrorProneEndpoint.failures /
            analysis.mostErrorProneEndpoint.count) *
          100
        ).toFixed(2)
      : "0.00";
    recs.push(
      `Most error-prone endpoint: ${analysis.mostErrorProneEndpoint.endpoint} — ${rate}% failures.`,
    );
  }

  if (analysis.duplicate && analysis.duplicate.duplicatePercentage > 0) {
    recs.push(
      `Detected ${analysis.duplicate.duplicates} duplicate lines (${analysis.duplicate.duplicatePercentage}%). Consider log deduplication or throttling.`,
    );
  }

  if (analysis.requests.successRate < 95) {
    recs.push(
      `Request success rate is ${analysis.requests.successRate}%. Investigate failed responses and upstream services.`,
    );
  }

  // traffic peaks
  if (Array.isArray(analysis.hourlyTraffic)) {
    const peak = analysis.hourlyTraffic
      .slice()
      .sort((a, b) => b.count - a.count)[0];
    if (peak && peak.count > 0 && peak.percentage > 20) {
      recs.push(
        `Traffic peak at hour ${peak.hour}: ${peak.count} requests (${peak.percentage}%). Consider scaling.`,
      );
    }
  }

  if (recs.length === 0)
    recs.push("No immediate recommendations — logs look healthy.");

  analysis.recommendations = recs;
}

export default finalizeRecommendations;
