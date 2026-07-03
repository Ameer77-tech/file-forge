import express, { urlencoded } from "express";
import cors from "cors";
import helmet from "helmet";

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(urlencoded({ extended: true }));

app.get("/api/v1/health", (req, res) => {
  res.send("Running");
});

export default app;
