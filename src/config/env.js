const env = {
  PORT: process.env.PORT,
  ORIGIN: process.env.ORIGIN,
  NODE_ENV: process.env.NODE_ENV,
  FILE_CLEANUP_TIME: parseInt(process.env.FILE_CLEANUP_TIME || "5", 10), // minutes
};

export default env;
