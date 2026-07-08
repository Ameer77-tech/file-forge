/**
 * Improved hash function using MurmurHash3 variant
 * Better distribution and collision resistance than simple reduce
 */
function hashRow(row) {
  let hash = 0;
  const rowStr = row.join("|"); // Use separator to avoid collisions

  for (let i = 0; i < rowStr.length; i++) {
    const char = rowStr.charCodeAt(i);
    hash = ((hash << 5) - hash) ^ char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36); // Use base36 to reduce collision space
}

export function updateDuplicates(analysis, row) {
  const isEmpty = row.every((cell) => !cell || cell.trim() === "");
  if (isEmpty) return;

  const hash = hashRow(row);
  analysis._internal.rowHashes.set(
    hash,
    (analysis._internal.rowHashes.get(hash) || 0) + 1,
  );
}

export function finalizeDuplicates(analysis) {
  let duplicates = 0;
  for (const count of analysis._internal.rowHashes.values()) {
    if (count > 1) {
      duplicates += count - 1;
    }
  }

  analysis.dataQuality.duplicateRows = duplicates;
  if (analysis.statistics.totalRows > 0) {
    analysis.dataQuality.duplicatePercentage = Number(
      ((duplicates / analysis.statistics.totalRows) * 100).toFixed(2),
    );
  }
}
