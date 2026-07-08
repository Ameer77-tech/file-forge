import { finalizeStatistics } from "./statistics.js";
import { finalizeTimeline } from "./timeline.js";
import { finalizePerformance } from "./performance.js";
import { finalizeRequests } from "./requests.js";
import { finalizeSecurity } from "./security.js";
import { finalizeErrors } from "./errors.js";
import { finalizeHealth } from "./health.js";
import { finalizeRecommendations } from "./recommendations.js";
import { finalizeFormat } from "./format.js";
import { finalizeDuplicates } from "./duplicates.js";
import { finalizeLogLevels } from "./levels.js";

export function finalizeAnalysis(analysis) {
  finalizeStatistics(analysis);

  finalizeTimeline(analysis);

  finalizePerformance(analysis);

  finalizeRequests(analysis);

  finalizeSecurity(analysis);

  finalizeErrors(analysis);

  finalizeDuplicates(analysis);

  finalizeFormat(analysis);

  finalizeLogLevels(analysis);

  finalizeHealth(analysis);

  finalizeRecommendations(analysis);

  // cleanup internal maps to make the analysis serializable
  if (analysis._internal) {
    delete analysis._internal;
  }
}

export default finalizeAnalysis;
