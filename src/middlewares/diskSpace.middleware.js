import fs from "fs";
import path from "path";

const UPLOADS_DIR = path.resolve("uploads");
const MAX_DISK_USAGE = 400 * 1024 * 1024; // 400 MB

const getFolderSize = (folderPath) => {
  let totalSize = 0;
  if (!fs.existsSync(folderPath)) return 0;
  
  const files = fs.readdirSync(folderPath);
  for (const file of files) {
    const stats = fs.statSync(path.join(folderPath, file));
    totalSize += stats.size;
  }
  return totalSize;
};

export const checkDiskSpace = (req, res, next) => {
  try {
    const currentSize = getFolderSize(UPLOADS_DIR);

    if (currentSize >= MAX_DISK_USAGE) {
      return res.status(503).json({
        success: false,
        message: "Server is currently busy processing other files. Please wait a few minutes and try again.",
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};
