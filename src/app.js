import express, { urlencoded } from "express";
import cors from "cors";
import helmet from "helmet";
import env from "./config/env.js";
import { httpLogger } from "./middlewares/requestsLogger.js";
import errorMiddleware from "./middlewares/error.middlware.js";
import NotFoundError from "./errors/NotFound.js";
import uploadRoutes from "./routes/uploadRoutes.js";

const app = express();

app.use(httpLogger);
app.use(
  cors({
    origin: env.ORIGIN,
  }),
);
app.use(helmet());
app.use(express.json());
app.use(urlencoded({ extended: true }));

app.get("/api/v1/health", (req, res) => {
  res.send("Running");
});

app.use("/api/v1", uploadRoutes);

app.use((req, res, next) => {
  throw new NotFoundError(`Route ${req.url} method ${req.method} not found`);
});
app.use(errorMiddleware);

export default app;
