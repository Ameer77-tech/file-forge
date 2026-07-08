import { finalizeStatistics } from "./statistics.js";
import { finalizeColumns } from "./columns.js";
import { finalizeDuplicates } from "./duplicates.js";
import { finalizeDataQuality } from "./dataQuality.js";
import { finalizeRecommendations } from "./recommendations.js";

export function finalizeAnalysis(analysis) {
  finalizeStatistics(analysis);
  finalizeDuplicates(analysis);
  finalizeColumns(analysis);
  finalizeDataQuality(analysis);
  finalizeRecommendations(analysis);

  // Remove internal data from production output
  delete analysis._internal;
}
