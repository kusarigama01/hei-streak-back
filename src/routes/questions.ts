import { Router } from "express";
import { authenticate, requireRole } from "../Security/authMiddleware.js";
import { putQuestion, deleteQuestionHandler }
    from "../Controller/QuestionController.js";

const router = Router();

router.use(authenticate, requireRole("admin"));

router.put("/:id", putQuestion);
router.delete("/:id", deleteQuestionHandler);

export default router;
