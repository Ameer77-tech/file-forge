import fs from "fs";
import path from "path";
import { parse } from "csv-parse";

import { createCsvAnalysis } from "./csv/analysisObject.js";
import { updateStatistics } from "./csv/statistics.js";
import { updateColumns } from "./csv/columns.js";
import { updateDuplicates } from "./csv/duplicates.js";
import { updatePatterns } from "./csv/patterns.js";
import { finalizeAnalysis } from "./csv/finalize.js";

export async function analyzeCsvFile(fileData) {
  const analysis = createCsvAnalysis(fileData);

  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(
      path.join(fileData.path, fileData.filename),
      {
        encoding: "utf8",
      },
    );

    const parser = parse({
      trim: false,
      skip_empty_lines: false,
      relax_quotes: true,
      escape: '"',
    });

    stream.pipe(parser);

    let headers = [];
    let isFirstRow = true;

    parser.on("readable", function () {
      let record;
      while ((record = parser.read()) !== null) {
        if (isFirstRow) {
          headers = record;
          analysis.statistics.totalColumns = headers.length;
          analysis.statistics.headerRow = headers;

          // Initialize columns
          headers.forEach((header) => {
            analysis.columns[header] = {};
          });

          isFirstRow = false;
        } else {
          if (record.length !== headers.length) {
            analysis.validation.inconsistentColumns++;
            analysis.validation.malformedRows++;
          }
          
          updateStatistics(analysis, record);
          updateColumns(analysis, headers, record);
          updateDuplicates(analysis, record);
          updatePatterns(analysis, record);
        }
      }
    });

    parser.on("error", (err) => {
      reject(err);
    });

    parser.on("end", () => {
      finalizeAnalysis(analysis);
      resolve(analysis);
    });
  });
}

export default analyzeCsvFile;
