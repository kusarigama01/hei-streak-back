import { Router } from "express";
import { authenticate, requireRole } from "../Security/authMiddleware.js";
import {
  listExams,
  getExam,
  createExam,
  updateExam,
  deleteExam,
} from "../Controller/ExamController.js";
import { getExamResults } from "../Controller/ResultsController.js";

const router = Router();

router.use(authenticate, requireRole("admin"));

router.get("/", listExams);
router.post("/", createExam);
router.get("/:id", getExam);
router.put("/:id", updateExam);
router.delete("/:id", deleteExam);
router.get("/:id/results", getExamResults);

export default router;