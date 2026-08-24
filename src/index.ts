import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import { pool } from "./config/db.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Health check endpoint: confirms the API can reach the database.
app.get("/api/health", async (_req, res) => {
  const result = await pool.query("SELECT NOW()");
  res.json({ status: "ok", db_time: result.rows[0].now });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});