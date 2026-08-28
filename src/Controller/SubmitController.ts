import type { NextFunction, Request, Response } from "express";
import { submitExam } from "../Service/SubmitService.js";
import { ApiError } from "../Service/ApiError.js";

export const postSubmit = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const examId = Number(req.params.id);
    const { answers } = req.body;

    if (!Array.isArray(answers)) {
      throw new ApiError(400, "Answers array is required");
    }

    const result = await submitExam(examId, req.user!.sub, answers);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};
