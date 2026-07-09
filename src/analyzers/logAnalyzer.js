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

  for await (const rawLine of rl) {
    const normalizedLines = rawLine.replace(/\\r\\n/g, '\n').replace(/\\n/g, '\n').replace(/\\r/g, '\n').split('\n');
    
    for (const line of normalizedLines) {
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

      // capture recent events (last 10)
      if (line.trim().length > 0) {
        analysis._internal.recentQueue ??= [];
        analysis._internal.recentQueue.push(line);
        if (analysis._internal.recentQueue.length > 10) {
          analysis._internal.recentQueue.shift();
        }
      }
    }
  }

  // Populate recent events at the end
  if (analysis._internal.recentQueue) {
    analysis.recentEvents = analysis._internal.recentQueue.map(line => {
      const tsMatch = line.match(/\b\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}(?:\.\d{3})?(?:Z|[+-]\d{2}:?\d{2})?\b/) || line.match(/\b\d{2}\/[A-Za-z]{3}\/\d{4}:\d{2}:\d{2}:\d{2}\b/);
      const lvlMatch = line.match(/\b(INFO|WARN|ERROR|DEBUG|FATAL|TRACE|CRITICAL)\b/i);
      return {
        timestamp: tsMatch ? tsMatch[0] : 'Unknown Time',
        level: lvlMatch ? lvlMatch[1].toUpperCase() : 'INFO',
        message: line.substring(0, 150).replace(/\b\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}.+?\b/, '').replace(/\b(INFO|WARN|ERROR|DEBUG|FATAL)\b/i, '').trim(),
      };
    });
  }

  finalizeAnalysis(analysis);
  return analysis;
}
