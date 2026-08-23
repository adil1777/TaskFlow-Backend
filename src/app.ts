import express from "express";
import cors from "cors";
import helmet from "helmet";
import  statusCodes from "../src/utils/statusCodes"

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(statusCodes.OK).json({
    success: true,
    message: "TaskFlow API is running",
  });
});

export default app;