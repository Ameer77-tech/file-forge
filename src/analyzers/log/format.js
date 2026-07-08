export function detectFormatFromLine(line) {
  const l = line;

  if (/"level"\s*:\s*"/i.test(l) && /"msg"\s*:/i.test(l)) return "Pino";
  if (/"level"\s*:\s*"/i.test(l) && /metadata|message|stack/i.test(l))
    return "Winston";
  if (
    /\b(GET|POST|PUT|PATCH|DELETE)\b/.test(l) &&
    /HTTP\//i.test(l) &&
    /" \d{3} /i.test(l)
  )
    return "Nginx/Apache";
  if (/"level"\s*:\s*"/i.test(l) && /pid|hostname|time/i.test(l))
    return "PM2/Pino";
  if (/"status"\s*:\s*\d{3}/i.test(l) && /method|url/i.test(l))
    return "Express/Morgan";
  if (/\bTRACE\b|\bDEBUG\b/.test(l) && /NestJS/.test(l)) return "NestJS";
  if (/\bWARN|ERROR\b/.test(l) && /java.lang.|at\s+\w+\(/i.test(l))
    return "Spring Boot";
  if (/\bLaravel\b|\bIlluminate\\/i.test(l)) return "Laravel";
  if (/\bINFO\b.*\b%[0-9]+\$s/.test(l)) return "Go logrus";
  if (/\bTraceback \(/i.test(l) || /Python logging/.test(l)) return "Python";

  return "Unknown";
}

export function updateFormat(analysis, line) {
  const f = detectFormatFromLine(line);
  analysis._internal.formatCounts ??= new Map();
  analysis._internal.formatCounts.set(
    f,
    (analysis._internal.formatCounts.get(f) || 0) + 1,
  );
}

export function finalizeFormat(analysis) {
  const counts = analysis._internal.formatCounts || new Map();
  let best = "Unknown";
  let bestCount = 0;
  for (const [k, v] of counts.entries()) {
    if (v > bestCount) {
      best = k;
      bestCount = v;
    }
  }
  analysis.detectedFormat = best;
  analysis.detectedFormatReasons =
    best === "Unknown" ? [] : [`${bestCount} matching lines`];
}

export default { detectFormatFromLine, updateFormat, finalizeFormat };
