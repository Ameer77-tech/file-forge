export function detectPatterns(analysis, value) {
  if (!value || value.trim() === "") return;

  const trimmed = value.trim().toLowerCase();

  // Email (strict)
  if (/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(trimmed)) {
    analysis.detections.emails++;
  }

  // URL (must start with protocol)
  if (/^https?:\/\/.+/.test(trimmed)) {
    analysis.detections.urls++;
  }

  // Phone (strict E.164 and common formats, excluding IPs and dates)
  if (
    /^\+?[1-9]\d{0,3}[-.\s]?(?:\(\d{1,4}\)[-.\s]?)?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/.test(
      trimmed,
    )
  ) {
    // Exclude IPs, dates, timestamps - must have actual phone format indicators
    if (!/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(trimmed)) {
      // Exclude if contains too many digits after separators (likely not phone)
      const digitOnly = trimmed.replace(/\D/g, "");
      if (digitOnly.length >= 10 && digitOnly.length <= 15) {
        analysis.detections.phoneNumbers++;
      }
    }
  }

  // IPv4 (strict validation)
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(trimmed)) {
    const parts = trimmed.split(".");
    if (parts.every((p) => parseInt(p) <= 255)) {
      analysis.detections.ipv4++;
    }
  }

  // IPv6
  if (/^([0-9a-f]{0,4}:){2,7}[0-9a-f]{0,4}$/i.test(trimmed)) {
    analysis.detections.ipv6++;
  }

  // UUID
  if (
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      trimmed,
    )
  ) {
    analysis.detections.uuids++;
  }

  // Monetary (currency symbols or numeric with currency formatting)
  if (/^[\$€£¥][\d,]+\.?\d*$/.test(trimmed)) {
    analysis.detections.monetaryValues++;
  }

  // Date (YYYY-MM-DD format only, since timestamps are separate)
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    analysis.detections.dates++;
  }

  // Timestamp (ISO format with T or space and time, case-insensitive)
  if (/^\d{4}-\d{2}-\d{2}[t ]\d{2}:\d{2}(:\d{2})?/.test(trimmed)) {
    analysis.detections.timestamps++;
  }

  // PAN Card (Indian)
  if (/^[a-z]{5}\d{4}[a-z]{1}$/.test(trimmed)) {
    analysis.detections.panCards = (analysis.detections.panCards || 0) + 1;
  }

  // Aadhaar Card (Indian)
  if (/^\d{4}[\s-]?\d{4}[\s-]?\d{4}$/.test(trimmed) && trimmed.length >= 12 && trimmed.length <= 14 && !/^\d{1,3}\.\d/.test(trimmed)) {
    analysis.detections.aadhaar = (analysis.detections.aadhaar || 0) + 1;
  }

  // Credit Card (Basic pattern - Luhn is expensive so just pattern)
  if (/^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|6(?:011|5[0-9][0-9])[0-9]{12})$/.test(trimmed.replace(/[\s-]/g, ''))) {
    analysis.detections.creditCards = (analysis.detections.creditCards || 0) + 1;
  }

  // Basic Address (very naive)
  if (/\d+[\s]+[a-z0-9\s]+(?:street|st|avenue|ave|road|rd|boulevard|blvd|lane|ln|drive|dr)\b/i.test(trimmed)) {
    analysis.detections.addresses = (analysis.detections.addresses || 0) + 1;
  }
}

export function updatePatterns(analysis, row) {
  row.forEach((cell) => {
    detectPatterns(analysis, cell);
  });
}
