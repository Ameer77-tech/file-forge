import fs from "fs";
import path from "path";
import uploadedFiles from "../utils/metaData.js";

/**
 * File Cleanup Manager
 * Automatically deletes files and metadata after specified duration
 */

const cleanupTimers = new Map(); // Store timers by file ID

export function scheduleFileCleanup(fileData, cleanupTimeMinutes = 5) {
  // Handle both cases: full metadata object or just { fileId, size }
  let fileId, fileName;

  if (fileData.id) {
    // Full metadata object (from saveMultipartUpload via uploadedFiles)
    fileId = fileData.id;
    fileName = fileData.originalName;
  } else if (fileData.fileId) {
    // Partial object from saveMultipartUpload return value
    fileId = fileData.fileId;
    const fullData = uploadedFiles.get(fileId);
    fileName = fullData ? fullData.originalName : `File ${fileId}`;
  } else {
    console.error("❌ Invalid fileData structure:", fileData);
    return;
  }

  // Clear existing timer if any
  if (cleanupTimers.has(fileId)) {
    clearTimeout(cleanupTimers.get(fileId));
  }

  // Schedule deletion
  const cleanupTimeMs = cleanupTimeMinutes * 60 * 1000;

  const timer = setTimeout(() => {
    deleteFile(fileId);
  }, cleanupTimeMs);

  cleanupTimers.set(fileId, timer);

  console.log(
    `⏰ File cleanup scheduled: ${fileName} (${cleanupTimeMinutes} mins)`,
  );
}

export function deleteFile(fileId, fileData = null) {
  const data = fileData || uploadedFiles.get(fileId);

  if (!data) {
    console.warn(`⚠️  File not found for deletion: ${fileId}`);
    return;
  }

  try {
    // Delete physical file if path exists
    if (data.path && data.filename) {
      const filePath = path.join(data.path, data.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`🗑️  Deleted file: ${data.originalName || data.filename}`);
      }
    }

    // Remove from metadata
    uploadedFiles.delete(fileId);
    console.log(`🗑️  Removed metadata: ${data.originalName || data.filename}`);
  } catch (err) {
    console.error(`❌ Error deleting file ${fileId}:`, err.message);
  }

  // Clear timer
  if (cleanupTimers.has(fileId)) {
    clearTimeout(cleanupTimers.get(fileId));
    cleanupTimers.delete(fileId);
  }
}

export function cancelFileCleanup(fileId) {
  if (cleanupTimers.has(fileId)) {
    clearTimeout(cleanupTimers.get(fileId));
    cleanupTimers.delete(fileId);
    console.log(`✅ Cleanup cancelled for file: ${fileId}`);
  }
}

export function getCleanupStatus(fileId) {
  const fileData = uploadedFiles.get(fileId);
  if (!fileData) return null;

  return {
    fileId,
    fileName: fileData.originalName,
    scheduled: cleanupTimers.has(fileId),
  };
}
