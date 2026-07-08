export const regex = {
  // Accept ISO timestamps with optional milliseconds and timezone, or bracketed 'YYYY-MM-DD HH:MM:SS'
  timestamp:
    /(?:\[)?(\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?)/,

  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,

  url: /https?:\/\/[^\s]+/g,

  ipv4: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,

  ipv6: /\b(?:[0-9a-f]{1,4}:){1,7}[0-9a-f]{1,4}\b/gi,

  uuid: /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/gi,

  phone: /\+?\d[\d\s-]{7,}\d/g,

  // Only match endpoints starting with a slash or http(s)://
  endpoint:
    /\b(GET|POST|PUT|PATCH|DELETE)\s+((?:https?:\/\/[^\s]+)|(?:\/[^\s]*))/,

  // common response time fields like responseTime, duration, latency, time_ms (millisecond values)
  responseTime:
    /(?:responseTime|duration|latency|time[_-]?ms|took)[=:"\s]*?(\d+)(?:ms)?/i,

  // common status patterns: "status":200, "statusCode":200, status=200, or HTTP/1.1" 200
  status:
    /(?:"status"\s*[:=]\s*|"statusCode"\s*[:=]\s*|status_code[:=]\s*|status[:=]\s*|HTTP\/\d\.\d"?\s*)(\d{3})\b/i,

  jwt: /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g,

  bearer: /Bearer\s+[A-Za-z0-9._-]+/g,

  apiKey: /(?:api[_-]?key|apikey)[:=\s]*[A-Za-z0-9_-]+/gi,

  awsKey: /\bAKIA[0-9A-Z]{16}\b/g,

  mongodbId: /\b[a-f0-9]{24}\b/gi,
};
