const uploadCooldown = new Map();
const analysisCooldown = new Map();

const activeUploads = new Map();
const activeAnalysis = new Map();

const UPLOAD_COOLDOWN = 60 * 1000; // 1 minute
const ANALYSIS_COOLDOWN = 15 * 1000; // 15 seconds

const MAX_UPLOADS_PER_IP = 1;
const MAX_ANALYSIS_PER_IP = 1;

/* ---------------- Upload Limiter ---------------- */

export const uploadLimiter = (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();

  // Cooldown
  const lastUpload = uploadCooldown.get(ip);

  if (lastUpload && now - lastUpload < UPLOAD_COOLDOWN) {
    const remaining = Math.ceil((UPLOAD_COOLDOWN - (now - lastUpload)) / 1000);

    return res.status(429).json({
      success: false,
      message: `Please wait ${remaining}s before uploading another file.`,
    });
  }

  // Concurrent upload check
  const active = activeUploads.get(ip) || 0;

  if (active >= MAX_UPLOADS_PER_IP) {
    return res.status(429).json({
      success: false,
      message: "An upload is already in progress.",
    });
  }

  uploadCooldown.set(ip, now);
  activeUploads.set(ip, active + 1);

  let released = false;

  const release = () => {
    if (released) return;
    released = true;

    const current = activeUploads.get(ip) || 1;

    if (current <= 1) {
      activeUploads.delete(ip);
    } else {
      activeUploads.set(ip, current - 1);
    }
  };

  res.on("finish", release);
  res.on("close", release);

  next();
};

/* ---------------- Analysis Limiter ---------------- */

export const analysisLimiter = (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();

  // Cooldown
  const lastAnalysis = analysisCooldown.get(ip);

  if (lastAnalysis && now - lastAnalysis < ANALYSIS_COOLDOWN) {
    const remaining = Math.ceil(
      (ANALYSIS_COOLDOWN - (now - lastAnalysis)) / 1000,
    );

    return res.status(429).json({
      success: false,
      message: `Please wait ${remaining}s before analyzing again.`,
    });
  }

  // Concurrent analysis check
  const active = activeAnalysis.get(ip) || 0;

  if (active >= MAX_ANALYSIS_PER_IP) {
    return res.status(429).json({
      success: false,
      message: "An analysis is already running.",
    });
  }

  analysisCooldown.set(ip, now);
  activeAnalysis.set(ip, active + 1);

  let released = false;

  const release = () => {
    if (released) return;
    released = true;

    const current = activeAnalysis.get(ip) || 1;

    if (current <= 1) {
      activeAnalysis.delete(ip);
    } else {
      activeAnalysis.set(ip, current - 1);
    }
  };

  res.on("finish", release);
  res.on("close", release);

  next();
};
