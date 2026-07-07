import logger from "../config/logger.js";
import uploadedFiles from "../utils/metaData.js";
import NotFoundError from "../errors/NotFound.js";
import analyzeFile from "../services/analyze.service.js";

export const analyzeController = async (req, res, next) => {
  const fileId = req.params.id;
  if (!uploadedFiles.has(fileId)) {
    throw new NotFoundError("File Not Found");
  } else {
    try {
      const analyzed = await analyzeFile(fileId);
      return res
        .status(200)
        .json({ message: "File Analyzed", success: true, data: analyzed });
    } catch (err) {
      next(err);
    }
  }
};
