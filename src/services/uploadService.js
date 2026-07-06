import fs from "fs";
import path from "path";
import crypto from "crypto";
import logger from "../config/logger.js";
import UnsupportedMediaTypeError from "../errors/UnsopportedMediaType.js";
import BadRequestError from "../errors/BadRequest.js";

const allowedMimeTypes = new Set([
  "text/plain",
  "text/csv",
  "application/csv",
  "application/vnd.ms-excel",
]);

const allowedExtensions = new Set([".txt", ".log", ".csv"]);

const validateUploadInput = (contentType, fileName) => {
  const normalizedType = contentType.toLowerCase();
  const extension = path.extname(fileName || "").toLowerCase();
  const isTextUpload = [...allowedMimeTypes].some((type) =>
    normalizedType.includes(type),
  );
  const isAllowedExtension = allowedExtensions.has(extension);

  if (!isTextUpload && !isAllowedExtension) {
    throw new UnsupportedMediaTypeError("Unsupported file type");
  }

  return { isTextUpload, extension };
};

export const saveRawUpload = ({ contentType, bodyBuffer, fileName }) => {
  if (!bodyBuffer || !bodyBuffer.length) {
    throw new BadRequestError("No File Uploaded");
  }

  const { extension } = validateUploadInput(contentType, fileName);
  const uploadDir = path.resolve("uploads");
  const filename = `${crypto.randomUUID()}${extension || ".txt"}`;
  const filePath = path.join(uploadDir, filename);

  fs.mkdirSync(uploadDir, { recursive: true });
  fs.writeFileSync(filePath, bodyBuffer);

  logger.info(
    {
      event: "upload.received",
      filename: fileName || "upload.txt",
      size: bodyBuffer.length,
      path: filePath,
    },
    "Raw upload completed",
  );

  return {
    filename: fileName || "upload.txt",
    size: bodyBuffer.length,
    path: filePath,
  };
};

export const saveMultipartUpload = (req) => {
  if (!req.file) {
    throw new BadRequestError("No File Uploaded");
  }

  const extension = path.extname(req.file.originalname || "").toLowerCase();
  const mimetype = req.file.mimetype || "";

  if (!allowedExtensions.has(extension) && !allowedMimeTypes.has(mimetype)) {
    throw new UnsupportedMediaTypeError("Unsupported file type");
  }

  logger.info(
    {
      event: "upload.received",
      filename: req.file.originalname,
      size: req.file.size,
      path: req.file.path,
    },
    "Multipart upload completed",
  );

  return {
    filename: req.file.filename,
    size: `${(req.file.size / 1024 / 1024).toFixed(2)} MB`,
  };
};
