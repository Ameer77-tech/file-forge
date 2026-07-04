import app from "./app.js";
import env from "./config/env.js";
import logger from "./config/logger.js";

const PORT = env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`SERVER RUNNING ON PORT ${PORT}`);
});
