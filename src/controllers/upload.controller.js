import logger from "../config/logger.js";
import {
  saveMultipartUpload,
  saveRawUpload,
} from "../services/upload.service.js";

export const uploadController = (req, res, next) => {
  const contentType = req.headers["content-type"] || "";
  const normalizedType = contentType.toLowerCase();

  if (normalizedType.includes("multipart/form-data")) {
    try {
      const uploadResult = saveMultipartUpload(req);
      logger.info(
        { event: "upload.controller.success" },
        "Multipart upload handled",
      );

      return res.status(200).json({
        success: true,
        message: "File uploaded successfully",
        file: uploadResult,
      });
    } catch (err) {
      next(err);
    }
  }

  const chunks = [];

  req.on("data", (chunk) => {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  });

  req.on("end", () => {
    const buffer = Buffer.concat(chunks);
    const uploadResult = saveRawUpload({
      contentType,
      bodyBuffer: buffer,
      fileName: req.headers["x-file-name"] || "upload.txt",
    });

    logger.info({ event: "upload.controller.success" }, "Raw upload handled");

    return res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      file: uploadResult,
    });
  });

  req.on("error", (err) => next(err));
};
