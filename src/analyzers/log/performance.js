import { regex } from "./regex.js";

export function updatePerformance(analysis, line) {
  // quick substring checks to avoid expensive regex when unlikely
  if (
    line.indexOf("responseTime") === -1 &&
    line.indexOf("duration") === -1 &&
    line.indexOf("latency") === -1 &&
    line.indexOf("time") === -1 &&
    line.indexOf("ms") === -1
  ) {
    return;
  }

  const match = line.match(regex.responseTime);

  if (!match) return;

  const responseTime = Number(match[1] || match[2]);

  analysis._internal.totalResponseTime ??= 0;
  analysis._internal.responseTimeCount ??= 0;

  // totals
  analysis._internal.totalResponseTime += responseTime;
  analysis._internal.responseTimeCount++;

  // reservoir sampling for percentiles (bounded memory)
  analysis._internal.responseTimeSamples ??= [];
  analysis._internal.responseSampleSeen ??= 0;
  const maxSamples = analysis._internal.maxResponseSamples || 5000;
  analysis._internal.responseSampleSeen++;

  if (analysis._internal.responseTimeSamples.length < maxSamples) {
    analysis._internal.responseTimeSamples.push(responseTime);
  } else {
    // replace element with decreasing probability
    const r = Math.floor(Math.random() * analysis._internal.responseSampleSeen);
    if (r < maxSamples) {
      analysis._internal.responseTimeSamples[r] = responseTime;
    }
  }

  if (
    analysis.responseTime.min === null ||
    responseTime < analysis.responseTime.min
  ) {
    analysis.responseTime.min = responseTime;
  }

  if (
    analysis.responseTime.max === null ||
    responseTime > analysis.responseTime.max
  ) {
    analysis.responseTime.max = responseTime;
  }

  if (responseTime > 100) analysis.responseTime.over100ms++;

  if (responseTime > 500) analysis.responseTime.over500ms++;

  if (responseTime > 1000) analysis.responseTime.over1000ms++;

  // expose last response time for this line so other modules (eg. requests)
  // can attach it to endpoint stats without re-running the regex
  analysis._internal._lastResponseTime = responseTime;
}

export function finalizePerformance(analysis) {
  if (!analysis._internal.responseTimeCount) return;

  analysis.responseTime.average = Number(
    (
      analysis._internal.totalResponseTime /
      analysis._internal.responseTimeCount
    ).toFixed(2),
  );

  // derive median, p95, p99 from sample
  const samples = analysis._internal.responseTimeSamples ?? [];
  if (samples.length > 0) {
    const sorted = samples.slice().sort((a, b) => a - b);
    const pct = (p) => {
      const idx = Math.floor((p / 100) * (sorted.length - 1));
      return sorted[Math.max(0, Math.min(sorted.length - 1, idx))];
    };

    analysis.responseTime.median = Number(pct(50).toFixed(2));
    analysis.responseTime.p95 = Number(pct(95).toFixed(2));
    analysis.responseTime.p99 = Number(pct(99).toFixed(2));
  } else {
    analysis.responseTime.median = null;
    analysis.responseTime.p95 = null;
    analysis.responseTime.p99 = null;
  }

  // error rate
  analysis.responseTime.errorRate =
    analysis.requests.total === 0
      ? 0
      : Number(
          ((analysis.requests.failed / analysis.requests.total) * 100).toFixed(
            2,
          ),
        );
}
