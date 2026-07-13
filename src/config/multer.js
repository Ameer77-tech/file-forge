import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import logger from "./logger.js";
import UnsupportedMediaTypeError from "../errors/UnsopportedMediaType.js";
import BadRequestError from "../errors/BadRequest.js";

const allowedMimeTypes = new Set([
  "text/plain",
  "text/csv",
  "application/csv",
  "application/vnd.ms-excel",
  "application/octet-stream",
]);

const allowedExtensions = new Set([".txt", ".log", ".csv"]);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.resolve("uploads");

    logger.info(
      {
        event: "upload.storage.destination",
        file: file?.originalname ?? "unknown",
        uploadDir,
      },
      "Preparing upload destination",
    );

    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const uniqueId = crypto.randomUUID();
    const extension = path.extname(file.originalname);

    logger.info(
      { event: "upload.storage.filename", file: file.originalname, extension },
      "Generating upload filename",
    );
    cb(null, `${uniqueId}${extension}`);
  },
});

export const upload = multer({
  storage,

  limits: {
    files: 1,
    fileSize: 100 * 1024 * 1024, // 100 MB
  },

  fileFilter: (req, file, cb) => {
    const extension = path.extname(file?.originalname || "").toLowerCase();
    const mimetype = file?.mimetype || "";
    const isAllowedExtension = allowedExtensions.has(extension);
    const isAllowedMimeType = allowedMimeTypes.has(mimetype);

    // if (!file || !file.originalname) {  // DEAD CODE NOT NEEDED IF THERE IS NO FILE UPLOADED AT ALL
    //   logger.warn(
    //     { event: "upload.fileFilter.invalid" },
    //     "Upload rejected because no file was provided",
    //   );
    //   return cb(new BadRequestError("No file uploaded"), false);
    // }
    if (!isAllowedExtension || !isAllowedMimeType) {
      logger.warn(
        {
          event: "upload.fileFilter.rejected",
          filename: file.originalname,
          mimetype,
          extension,
        },
        "Unsupported file type",
      );

      return cb(new UnsupportedMediaTypeError("Unsupported file mime type"));
    }

    logger.info(
      {
        event: "upload.fileFilter.accepted",
        filename: file.originalname,
        mimetype,
        extension,
      },
      "File accepted for upload",
    );
    cb(null, true);
  },
});
