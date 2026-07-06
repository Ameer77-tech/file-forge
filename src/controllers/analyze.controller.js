import logger from "../config/logger.js";
import uploadedFiles from "../utils/metaData.js";
import NotFoundError from "../errors/NotFound.js";
import analyzeFile from "../services/analyze.service.js";

export const analyzeController = (req, res, next) => {
  const fileId = req.params.id;
  if (!uploadedFiles.has(fileId)) {
    throw new NotFoundError("File Not Found");
  } else {
    try {
      const analyzed = analyzeFile(fileId);
    } catch (err) {
      next(err);
    }
  }
};
