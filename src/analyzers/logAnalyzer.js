import fs from "fs";
import path from "path";
import readline from "readline";

import { createAnalysis } from "./log/analysisObject.js";
import { updateStatistics, finalizeStatistics } from "./log/statistics.js";
import { updateTimeline, finalizeTimeline } from "./log/timeline.js";
import { updateRequests, finalizeRequests } from "./log/requests.js";
import { updatePerformance, finalizePerformance } from "./log/performance.js";
import { updateSecurity, finalizeSecurity } from "./log/security.js";
import { updateErrors, finalizeErrors } from "./log/errors.js";
import { finalizeAnalysis } from "./log/finalize.js";
import { updateLogLevel } from "./log/levels.js";
import { updateDuplicates } from "./log/duplicates.js";
import { updateFormat } from "./log/format.js";

export async function analyzeLogFile(fileData) {
  const stream = fs.createReadStream(
    path.join(fileData.path, fileData.filename),
    {
      encoding: "utf8",
      // use a 1MB buffer to balance throughput and memory
      highWaterMark: 1024 * 1024,
    },
  );

  const rl = readline.createInterface({
    input: stream,
    crlfDelay: Infinity,
  });

  const analysis = createAnalysis(fileData);

  for await (const line of rl) {
    updateStatistics(analysis, line);

    updateTimeline(analysis, line);

    // parse response time first so requests can pick it up without re-running regexes
    updatePerformance(analysis, line);

    updateRequests(analysis, line);

    updateSecurity(analysis, line);

    updateErrors(analysis, line);

    // detect log level
    updateLogLevel(analysis, line);

    // detect format
    updateFormat(analysis, line);

    // detect duplicates
    updateDuplicates(analysis, line);
  }

  finalizeAnalysis(analysis);
  return analysis;
}
