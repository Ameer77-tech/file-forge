export function updateStatistics(analysis, line) {
  analysis.statistics.lines++;
  analysis.statistics.characters += line.length;
  // bytes processed for metadata
  analysis.bytesProcessed =
    (analysis.bytesProcessed || 0) + Buffer.byteLength(line, "utf8");
  analysis._internal.bytesProcessed =
    (analysis._internal.bytesProcessed || 0) + Buffer.byteLength(line, "utf8");

  if (line.trim() === "") {
    analysis.statistics.emptyLines++;
    return;
  }

  if (line.length > analysis.longestLine.length) {
    analysis.longestLine.length = line.length;
    analysis.longestLine.content = line;
  }
}

export function finalizeStatistics(analysis) {
  if (analysis.statistics.lines > 0) {
    analysis.statistics.averageLineLength = Number(
      (analysis.statistics.characters / analysis.statistics.lines).toFixed(2),
    );
  }
}
