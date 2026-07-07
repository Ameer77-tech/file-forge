import logger from "../config/logger.js";
import uploadedFiles from "../utils/metaData.js";
import NotFoundError from "../errors/NotFound.js";
import analyzeFile from "../services/analyze.service.js";
import SuccessResponse from "../utils/SuccessResponse.js";

export const analyzeController = async (req, res, next) => {
  const fileId = req.params.id;
  if (!uploadedFiles.has(fileId)) {
    throw new NotFoundError("File Not Found");
  } else {
    try {
      const analyzed = await analyzeFile(fileId);
      return SuccessResponse("File Analyzed", analyzed, res);
    } catch (err) {
      next(err);
    }
  }
};
