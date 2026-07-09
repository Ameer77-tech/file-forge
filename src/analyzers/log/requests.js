import { regex } from "./regex.js";

export function updateRequests(analysis, line) {
  // quick check to avoid matching SQL or unrelated text: only attempt endpoint
  // parsing if common HTTP method tokens are present
  const hasMethodToken =
    line.indexOf("GET ") !== -1 ||
    line.indexOf("POST ") !== -1 ||
    line.indexOf("PUT ") !== -1 ||
    line.indexOf("PATCH ") !== -1 ||
    line.indexOf("DELETE ") !== -1;

  const endpoint = hasMethodToken ? line.match(regex.endpoint) : null;
  let key = null;

  if (endpoint) {
    const method = endpoint[1];
    const route = endpoint[2];

    analysis.httpMethods[method]++;

    analysis.requests.total++;

    if (analysis._internal._lastHour) {
      analysis._internal.hourlyRequests ??= {};
      analysis._internal.hourlyRequests[analysis._internal._lastHour] = (analysis._internal.hourlyRequests[analysis._internal._lastHour] || 0) + 1;
    }

    key = `${method} ${route}`;
    analysis._internal.endpointMap.set(
      key,
      (analysis._internal.endpointMap.get(key) || 0) + 1,
    );

    // ensure endpointStats entry
    if (!analysis._internal.endpointStats.has(key)) {
      analysis._internal.endpointStats.set(key, {
        count: 0,
        totalResponseTime: 0,
        failures: 0,
        successes: 0,
      });
    }
    const stats = analysis._internal.endpointStats.get(key);
    stats.count++;
  }

  // Try structured status patterns first ("status":200, HTTP/1.1 200, etc.)
  let statusCode = null;
  const structuredStatus = line.match(regex.status);
  if (structuredStatus) {
    statusCode = Number(structuredStatus[1]);
  }

  // If no structured match, try bare status code after HTTP method + endpoint
  // e.g. "GET /api/users 200 18ms"
  if (statusCode === null && hasMethodToken) {
    const endpointStatus = line.match(regex.endpointStatus);
    if (endpointStatus) {
      statusCode = Number(endpointStatus[1]);
    }
  }

  if (statusCode !== null) {
    analysis.statusCodes.set(statusCode, (analysis.statusCodes.get(statusCode) || 0) + 1);

    if (statusCode >= 200 && statusCode < 400) {
      // 2xx = success, 3xx = redirect (not a failure)
      analysis.requests.successful++;
      if (key) {
        const stats = analysis._internal.endpointStats.get(key);
        if (stats) stats.successes++;
      }
    } else if (statusCode >= 400) {
      // 4xx and 5xx = failed
      analysis.requests.failed++;
      if (key) {
        const stats = analysis._internal.endpointStats.get(key);
        if (stats) stats.failures++;
      }
    }
  }

  // attach response time from performance module if present
  if (
    analysis._internal &&
    typeof analysis._internal._lastResponseTime === "number"
  ) {
    const responseTime = analysis._internal._lastResponseTime;
    // aggregate global counters (performance module also tracks samples)
    analysis._internal.totalResponseTime =
      (analysis._internal.totalResponseTime || 0) + responseTime;
    analysis._internal.responseTimeCount =
      (analysis._internal.responseTimeCount || 0) + 1;
    if (key) {
      const stats = analysis._internal.endpointStats.get(key);
      if (stats) stats.totalResponseTime += responseTime;
    }
    // clear for next line
    delete analysis._internal._lastResponseTime;
  }
}

export function finalizeRequests(analysis) {
  analysis.requests.successRate =
    analysis.requests.total === 0
      ? 0
      : Number(
          (
            (analysis.requests.successful / analysis.requests.total) *
            100
          ).toFixed(2),
        );

  analysis.topEndpoints = [...analysis._internal.endpointMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([endpoint, count]) => ({
      endpoint,
      count,
    }));

  analysis.statusCodes = Object.fromEntries(
    [...analysis.statusCodes.entries()].sort((a, b) => a[0] - b[0]),
  );

  // most common status
  let mostCommon = null;
  const entries = Object.entries(analysis.statusCodes);
  for (const [code, cnt] of entries) {
    const c = Number(code);
    const count = Number(cnt);
    if (!mostCommon || count > mostCommon.count)
      mostCommon = { code: c, count };
  }
  analysis.mostCommonStatus = mostCommon;

  // build enriched endpoint stats array
  const endpointStats = [...analysis._internal.endpointStats.entries()].map(
    ([endpoint, s]) => ({
      endpoint,
      averageResponseTime: s.count ? Number((s.totalResponseTime / s.count).toFixed(2)) : 0,
      failures: s.failures,
      count: s.count,
    }),
  );

  // slowest endpoint (highest average response time)
  const bySlowest = endpointStats.slice().sort((a, b) => b.averageResponseTime - a.averageResponseTime);
  analysis.slowestEndpoint = bySlowest.length ? bySlowest[0] : null;

  // most error-prone endpoint by failure RATE (not absolute failures)
  // Only consider endpoints that have at least one failure
  const withFailures = endpointStats.filter(e => e.failures > 0);
  if (withFailures.length > 0) {
    withFailures.sort(
      (a, b) => (b.failures / b.count) - (a.failures / a.count),
    );
    analysis.mostErrorProneEndpoint = withFailures[0];
  } else {
    // fall back to showing the one with the highest count if none have failures
    const byCount = endpointStats.slice().sort((a, b) => b.count - a.count);
    analysis.mostErrorProneEndpoint = byCount.length ? byCount[0] : null;
  }
}
