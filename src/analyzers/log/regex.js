export const regex = {
  // Accept ISO timestamps with optional milliseconds and timezone, or bracketed 'YYYY-MM-DD HH:MM:SS'
  timestamp:
    /(?:\[)?(\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?)/,

  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,

  url: /https?:\/\/[^\s]+/g,

  ipv4: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,

  ipv6: /\b(?:(?:[0-9a-f]{1,4}:){7}[0-9a-f]{1,4}|(?:[0-9a-f]{1,4}:){1,7}:|(?:[0-9a-f]{1,4}:){1,6}:[0-9a-f]{1,4}|(?:[0-9a-f]{1,4}:){1,5}(?::[0-9a-f]{1,4}){1,2}|(?:[0-9a-f]{1,4}:){1,4}(?::[0-9a-f]{1,4}){1,3}|(?:[0-9a-f]{1,4}:){1,3}(?::[0-9a-f]{1,4}){1,4}|(?:[0-9a-f]{1,4}:){1,2}(?::[0-9a-f]{1,4}){1,5}|[0-9a-f]{1,4}:(?:(?::[0-9a-f]{1,4}){1,6})|:(?:(?::[0-9a-f]{1,4}){1,7}|:))\b/gi,

  uuid: /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/gi,

  // Phone: +1 234 567 8901, 123-456-7890, etc. Prevent matching YYYY-MM-DD
  phone: /(?<!\d-)(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,

  // Only match endpoints starting with a slash or http(s)://
  endpoint:
    /\b(GET|POST|PUT|PATCH|DELETE)\s+((?:https?:\/\/[^\s]+)|(?:\/[^\s]*))/,

  // Capture status code that appears after an HTTP method + endpoint path
  // e.g. "GET /api/users 200 18ms" or "POST /api/login 401 28ms"
  endpointStatus:
    /\b(?:GET|POST|PUT|PATCH|DELETE)\s+\S+\s+(\d{3})\b/,

  // common response time fields like responseTime, duration, latency, time_ms (millisecond values)
  responseTime:
    /(?:responseTime|duration|latency|time[_-]?ms|took)[=:"\s]*?(\d+)(?:ms)?|\b(\d+)ms\b/i,

  // common status patterns: "status":200, "statusCode":200, status=200, or HTTP/1.1" 200
  status:
    /(?:"status"\s*[:=]\s*|"statusCode"\s*[:=]\s*|status_code[:=]\s*|status[:=]\s*|HTTP\/\d\.\d"?\s*)(\d{3})\b/i,

  jwt: /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g,

  bearer: /Bearer\s+[A-Za-z0-9._-]+/g,

  apiKey: /(?:api[_-]?key|apikey)[:=\s]*[A-Za-z0-9_-]+/gi,

  awsKey: /\bAKIA[0-9A-Z]{16}\b/g,

  mongodbId: /\b[a-f0-9]{24}\b/gi,
};
