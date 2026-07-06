import express from "express";
import { upload } from "../config/multer.js";
import { uploadController } from "../controllers/upload.controller.js";
import validateUpload from "../middlewares/validateUpload.js";
import { analyzeController } from "../controllers/analyze.controller.js";
import ValidateAnalyze from "../middlewares/validateAnalyze.js";

const router = express.Router();

router.get("/analyze/:id", ValidateAnalyze, analyzeController);

export default router;
