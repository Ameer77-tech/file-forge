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
      });
    }
    const stats = analysis._internal.endpointStats.get(key);
    stats.count++;
  }

  const status = line.match(regex.status);

  let statusCode = null;
  if (status) {
    const code = Number(status[1]);
    statusCode = code;

    analysis.statusCodes.set(code, (analysis.statusCodes.get(code) || 0) + 1);

    if (code >= 200 && code < 400) {
      analysis.requests.successful++;
    } else {
      analysis.requests.failed++;
      if (key) {
        const stats = analysis._internal.endpointStats.get(key);
        if (stats) stats.failures++;
      }
    }
  }

  // attach response time to endpoint stats when available
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
  const entries = analysis.statusCodes.entries
    ? analysis.statusCodes.entries()
    : Object.entries(analysis.statusCodes);
  for (const [code, cnt] of entries) {
    const c = Number(code);
    const count = Number(cnt);
    if (!mostCommon || count > mostCommon.count)
      mostCommon = { code: c, count };
  }
  analysis.mostCommonStatus = mostCommon;

  // slowest endpoint (highest average response time)
  const endpointStats = [...analysis._internal.endpointStats.entries()].map(
    ([endpoint, s]) => ({
      endpoint,
      averageResponseTime: s.count ? s.totalResponseTime / s.count : 0,
      failures: s.failures,
      count: s.count,
    }),
  );

  endpointStats.sort((a, b) => b.averageResponseTime - a.averageResponseTime);
  analysis.slowestEndpoint = endpointStats.length ? endpointStats[0] : null;

  // most error-prone endpoint by failure rate
  endpointStats.sort(
    (a, b) =>
      b.failures / Math.max(1, b.count) - a.failures / Math.max(1, a.count),
  );
  analysis.mostErrorProneEndpoint = endpointStats.length
    ? endpointStats[0]
    : null;
}
