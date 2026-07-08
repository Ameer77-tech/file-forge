import express from "express";
import { upload } from "../config/multer.js";
import { uploadController } from "../controllers/upload.controller.js";
import validateUpload from "../middlewares/validateUpload.js";
import {
  deleteFile,
  cancelFileCleanup,
  getCleanupStatus,
} from "../utils/fileCleanup.js";
import SuccessResponse from "../utils/SuccessResponse.js";
import NotFoundError from "../errors/NotFound.js";
import uploadedFiles from "../utils/metaData.js";

const router = express.Router();

router.post("/upload", validateUpload, (req, res, next) => {
  const contentType = req.headers["content-type"] || "";
  const normalizedType = contentType.toLowerCase();

  if (normalizedType.includes("multipart/form-data")) {
    return upload.single("file")(req, res, (err) => {
      if (err) {
        return next(err);
      }

      return uploadController(req, res, next);
    });
  }

  return uploadController(req, res, next);
});

// Manual file deletion endpoint
router.delete("/files/:id", (req, res, next) => {
  const fileId = req.params.id;

  if (!uploadedFiles.has(fileId)) {
    throw new NotFoundError("File not found");
  }

  const fileData = uploadedFiles.get(fileId);
  deleteFile(fileId, fileData);

  return SuccessResponse("File deleted successfully", { fileId }, res);
});

// Cancel automatic cleanup
router.post("/files/:id/cancel-cleanup", (req, res, next) => {
  const fileId = req.params.id;

  if (!uploadedFiles.has(fileId)) {
    throw new NotFoundError("File not found");
  }

  cancelFileCleanup(fileId);

  return SuccessResponse(
    "File cleanup cancelled - file will persist",
    { fileId },
    res,
  );
});

// Get cleanup status
router.get("/files/:id/status", (req, res, next) => {
  const fileId = req.params.id;

  if (!uploadedFiles.has(fileId)) {
    throw new NotFoundError("File not found");
  }

  const status = getCleanupStatus(fileId);

  return SuccessResponse("File status retrieved", status, res);
});

export default router;
