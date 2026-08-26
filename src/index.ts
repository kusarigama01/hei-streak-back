import express from "express";
import type { NextFunction, Request, Response } from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import { pool } from "./config/db.js";
import { postLogin } from "./Controller/AuthController.js";
import { authenticate, requireRole } from "./Security/authMiddleware.js";
import { postQuestion, putQuestion, deleteQuestionHandler } from "./Controller/QuestionController.js";
import { getMyExams, getMyExamDetail } from "./Controller/StudentExamController.js";
import { postSubmit } from "./Controller/SubmitController.js";
import { getMyResults } from "./Controller/StudentResultsController.js";
import { ApiError } from "./Service/ApiError.js";
import studentsRouter from "./routes/students.js";
import coursesRouter from "./routes/courses.js";
import examsRouter from "./routes/exams.js";


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

// --- Admin routes ---
app.post("/api/exams/:id/questions", authenticate, requireRole("admin"), postQuestion);
app.put("/api/exams/:id/questions/:questionId", authenticate, requireRole("admin"), putQuestion);
app.delete("/api/exams/:id/questions/:questionId", authenticate, requireRole("admin"), deleteQuestionHandler);

// --- Student routes ---
app.get("/api/my/exams", authenticate, requireRole("student"), getMyExams);
app.get("/api/my/exams/:id", authenticate, requireRole("student"), getMyExamDetail);
app.post("/api/my/exams/:id/submit", authenticate, requireRole("student"), postSubmit);
app.get("/api/my/results", authenticate, requireRole("student"), getMyResults);

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

app.use("/api/students", studentsRouter);
app.use("/api/courses", coursesRouter);
app.use("/api/exams", examsRouter);