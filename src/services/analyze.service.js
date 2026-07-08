import uploadedFiles from "../utils/metaData.js";
import fs from "fs";
import path from "path";
import readline from "readline";
import analyzeTextFile from "../analyzers/textAnalyzer.js";
import { analyzeLogFile } from "../analyzers/logAnalyzer.js";
import { analyzeCsvFile } from "../analyzers/csvAnalyzer.js";

const analyzeFile = async (fileId) => {
  const fileData = uploadedFiles.get(fileId);
  const type = path.extname(fileData.filename).slice(1);
  if (type == "txt") {
    try {
      const analyzed = await analyzeTextFile(fileData);
      return analyzed;
    } catch (err) {
      throw err;
    }
  }
  if (type == "log") {
    try {
      const analyzed = await analyzeLogFile(fileData);
      return analyzed;
    } catch (err) {
      throw err;
    }
  }
  if (type == "csv") {
    try {
      const analyzed = await analyzeCsvFile(fileData);
      return analyzed;
    } catch (err) {
      throw err;
    }
  }
};

export default analyzeFile;

/*
{
  originalName: 'cookies.txt',
  filename: '9b4f5d32-f547-42b1-955b-ce336e7dfee9.txt',
  id: '9b4f5d32-f547-42b1-955b-ce336e7dfee9',
  path: 'G:\\Projects\\web projects\\File Forge Api\\uploads',
  mimetype: 'text/plain',
  isAnalyzed: false,
  size: '0.43 MB'
} */
