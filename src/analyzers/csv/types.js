export function detectDataType(value) {
  if (!value || value.trim() === "") return "empty";

  const trimmed = value.trim().toLowerCase();

  // Boolean (must be before numeric)
  if (trimmed === "true" || trimmed === "false") return "boolean";

  // UUID (must be before numeric as UUIDs contain hyphens)
  if (
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      trimmed,
    )
  ) {
    return "uuid";
  }

  // IP Address (must be before numeric)
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(trimmed)) {
    const parts = trimmed.split(".");
    if (parts.every((p) => parseInt(p) <= 255)) return "ipaddress";
  }
  if (/^([0-9a-f]{0,4}:){2,7}[0-9a-f]{0,4}$/i.test(trimmed)) {
    return "ipaddress";
  }

  // Timestamp (ISO format with T or space separator - must be before date, case-insensitive)
  if (/^\d{4}-\d{2}-\d{2}[t ]\d{2}:\d{2}(:\d{2})?/.test(trimmed)) {
    return "timestamp";
  }

  // Date formats (YYYY-MM-DD, DD/MM/YYYY, MM-DD-YYYY)
  if (
    /^\d{4}-\d{2}-\d{2}$|^\d{1,2}\/\d{1,2}\/\d{2,4}$|^\d{1,2}-\d{1,2}-\d{2,4}$/.test(
      trimmed,
    )
  ) {
    return "date";
  }

  // Email
  if (/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(trimmed)) {
    return "email";
  }

  // URL
  if (/^https?:\/\//.test(trimmed)) return "url";

  // Monetary (with or without currency symbol)
  if (/^[\$€£¥]?[\d,]+\.?\d*$/.test(trimmed)) return "monetary";

  // Numeric (integer or decimal)
  if (
    !isNaN(trimmed) &&
    trimmed !== "" &&
    !/^0+$/.test(trimmed.replace(/\./g, ""))
  ) {
    if (trimmed.includes(".")) return "decimal";
    return "numeric";
  }

  // Strict Phone Number (E.164 or common formats)
  // +1-800-555-1234, +44 20 7946 0958, (555) 123-4567
  if (
    /^\+?[1-9]\d{0,3}[-.\s]?(?:\(\d{1,4}\)[-.\s]?)?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/.test(
      trimmed,
    )
  ) {
    // Exclude false positives: IPs, timestamps, dates
    if (
      !/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(trimmed) &&
      !/^\d{4}-\d{2}-\d{2}/.test(trimmed)
    ) {
      // Additional check: phone numbers should have 10-15 digits
      const digitOnly = trimmed.replace(/\D/g, "");
      if (digitOnly.length >= 10 && digitOnly.length <= 15) {
        return "phone";
      }
    }
  }

  return "text";
}
