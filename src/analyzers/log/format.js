export function detectFormatFromLine(line) {
  const l = line;
  const lt = l.trim();

  if (lt.startsWith('{') && lt.endsWith('}')) {
    if (/"level"\s*:\s*"/i.test(l) && /"msg"\s*:/i.test(l)) return "JSON (Pino)";
    if (/"level"\s*:\s*"/i.test(l) && /metadata|message|stack/i.test(l)) return "JSON (Winston)";
    if (/"level"\s*:\s*"/i.test(l) && /pid|hostname|time/i.test(l)) return "JSON (PM2)";
    if (/"status"\s*:\s*\d{3}/i.test(l) && /method|url/i.test(l)) return "JSON (Morgan)";
    return "JSON";
  }

  if (
    /\b(GET|POST|PUT|PATCH|DELETE)\b/.test(l) &&
    /HTTP\//i.test(l)
  ) {
    if (l.toLowerCase().includes("nginx")) return "Nginx";
    if (l.toLowerCase().includes("apache")) return "Apache";
    return "Nginx/Apache";
  }

  if (/\bTRACE\b|\bDEBUG\b/.test(l) && /NestJS/.test(l)) return "Application Log (NestJS)";
  if (/\bWARN|ERROR\b/.test(l) && /java\.lang\.|at\s+\w+\(/i.test(l)) return "Application Log (Spring Boot)";
  if (/\bLaravel\b|\bIlluminate\\/i.test(l)) return "Application Log (Laravel)";
  if (/\bINFO\b.*\b%[0-9]+\$s/.test(l)) return "Application Log (Go)";
  if (/\bTraceback \(/i.test(l) || /Python logging/.test(l)) return "Application Log (Python)";

  if (/\b(INFO|WARN|WARNING|ERROR|DEBUG|TRACE|FATAL)\b/i.test(l)) return "Application Log";

  if (l.includes(',')) {
    const parts = l.split(',');
    if (parts.length > 3 && !l.includes('{') && !l.includes('[')) return "CSV";
  }

  return "Plain Text";
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
