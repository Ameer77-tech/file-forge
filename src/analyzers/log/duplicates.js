// FNV-1a 32-bit hash for line hashing
function fnv1a32(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h >>> 0) * 0x01000193;
  }
  return (h >>> 0).toString(16);
}

export function updateDuplicates(analysis, line) {
  const map = analysis._internal.duplicateMap;
  const queue = analysis._internal.duplicateQueue;
  const window = analysis._internal.duplicateWindow || 10000;

  const key = fnv1a32(line);

  if (map.has(key)) {
    map.set(key, map.get(key) + 1);
    analysis._internal.duplicateCount =
      (analysis._internal.duplicateCount || 0) + 1;
  } else {
    map.set(key, 1);
    queue.push(key);
    if (queue.length > window) {
      const old = queue.shift();
      map.delete(old);
    }
  }
}

export function finalizeDuplicates(analysis) {
  const uniqueTracked = analysis._internal.duplicateMap.size;
  const duplicates = analysis._internal.duplicateCount || 0;
  const total = analysis.statistics.lines || 0;
  analysis.duplicate = {
    duplicates,
    uniqueTracked,
    duplicatePercentage:
      total === 0 ? 0 : Number(((duplicates / total) * 100).toFixed(2)),
  };
}

export default { updateDuplicates, finalizeDuplicates };
