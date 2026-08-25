import { Router } from "express";
import { authenticate, requireRole } from "../Security/authMiddleware.js";
import {
  listStudents,
  createStudent,
  updateStudent,
  deactivateStudent,
} from "../Controller/StudentController.js";

const router = Router();

router.use(authenticate, requireRole("admin"));

router.get("/", listStudents);
router.post("/", createStudent);
router.put("/:id", updateStudent);
router.delete("/:id", deactivateStudent);

export default router;