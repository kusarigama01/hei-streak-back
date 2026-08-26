import type { NextFunction, Request, Response } from "express";
import { createQuestionWithChoices, updateQuestionWithChoices, removeQuestion } from "../Service/QuestionService.js";
import { ApiError } from "../Service/ApiError.js";

export const postQuestion = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id: examId } = req.params;
    const { statement, points, choices } = req.body;

    if (!statement || typeof statement !== "string" || statement.trim() === "") {
      throw new ApiError(400, "Statement is required");
    }
    if (typeof points !== "number" || points <= 0) {
      throw new ApiError(400, "Points must be a positive number");
    }
    if (!Array.isArray(choices)) {
      throw new ApiError(400, "Choices array is required");
    }

    const question = await createQuestionWithChoices(examId, statement, points, choices);
    res.status(201).json(question);
  } catch (error) {
    next(error);
  }
};

export const putQuestion = async (req: Request<{ id: string; questionId: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { questionId } = req.params;
    const { statement, points, choices } = req.body;

    if (!statement || typeof statement !== "string" || statement.trim() === "") {
      throw new ApiError(400, "Statement is required");
    }
    if (typeof points !== "number" || points <= 0) {
      throw new ApiError(400, "Points must be a positive number");
    }
    if (!Array.isArray(choices)) {
      throw new ApiError(400, "Choices array is required");
    }

    const question = await updateQuestionWithChoices(questionId, statement, points, choices);
    res.status(200).json(question);
  } catch (error) {
    next(error);
  }
};

export const deleteQuestionHandler = async (req: Request<{ id: string; questionId: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { questionId } = req.params;
    await removeQuestion(questionId);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};
