import { Router } from "express";
import { authenticate, requireRole } from "../Security/authMiddleware.js";
import {
  listCourses,
  createCourse,
  updateCourse,
  deleteCourse,
} from "../Controller/CourseController.js";

const router = Router();

router.use(authenticate, requireRole("admin"));

router.get("/", listCourses);
router.post("/", createCourse);
router.put("/:id", updateCourse);
router.delete("/:id", deleteCourse);

export default router;