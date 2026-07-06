import express from "express";
import { upload } from "../config/multer.js";
import { uploadController } from "../controllers/upload.controller.js";
import validateUpload from "../middlewares/validateUpload.js";

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

export default router;
