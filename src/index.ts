import express from "express";
import type { NextFunction, Request, Response } from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import { pool } from "./config/db.js";
import { postLogin } from "./Controller/AuthController.js";
import { ApiError } from "./Service/ApiError.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Health check endpoint: confirms the API can reach the database.
app.get("/api/health", async (_req, res) => {
  const result = await pool.query("SELECT NOW()");
  res.json({ status: "ok", db_time: result.rows[0].now });
});

app.post("/api/auth/login", postLogin);

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction): void => {
  if (error instanceof ApiError) {
    res.status(error.status).json({ message: error.message });
    return;
  }
  console.error("Unhandled error:", error);
  res.status(500).json({ message: "Internal server error" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});