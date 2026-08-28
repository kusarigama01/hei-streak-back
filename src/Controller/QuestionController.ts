import type { NextFunction, Request, Response } from "express";
import { createQuestionWithChoices, updateQuestionWithChoices, removeQuestion } from "../Service/QuestionService.js";
import { findQuestionsByExamId } from "../Repositorie/QuestionRepository.js";
import { ApiError } from "../Service/ApiError.js";

export const postQuestion = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const examId = Number(req.params.id);
    const { statement, points, position, choices } = req.body;

    if (!statement || typeof statement !== "string" || statement.trim() === "") {
      throw new ApiError(400, "Statement is required");
    }
    if (typeof points !== "number" || points <= 0) {
      throw new ApiError(400, "Points must be a positive number");
    }
    if (!Array.isArray(choices)) {
      throw new ApiError(400, "Choices array is required");
    }
    for (const choice of choices) {
      if (choice === null || typeof choice !== "object" || typeof choice.text !== "string" || typeof choice.is_correct !== "boolean") {
        throw new ApiError(400, "Each choice must have a text and a boolean is_correct");
      }
    }

    const question = await createQuestionWithChoices(examId, statement, points, choices);
    res.status(201).json(question);
  } catch (error) {
    next(error);
  }
};

export const getExamQuestions = async (
    req: Request<{ id: string }>, res: Response, next: NextFunction,
): Promise<void> => {
    try {
        const questions = await findQuestionsByExamId(Number(req.params.id));
        res.status(200).json(questions);
    } catch (e) { next(e); }
};

export const putQuestion = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const questionId = Number(req.params.id);
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
    for (const choice of choices) {
      if (choice === null || typeof choice !== "object" || typeof choice.text !== "string" || typeof choice.is_correct !== "boolean") {
        throw new ApiError(400, "Each choice must have a text and a boolean is_correct");
      }
    }

    const question = await updateQuestionWithChoices(questionId, statement, points, choices);
    res.status(200).json(question);
  } catch (error) {
    next(error);
  }
};

export const deleteQuestionHandler = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const questionId = Number(req.params.id);
    await removeQuestion(questionId);
    res.status(200).json({ message: "Question deleted" });
  } catch (error) {
    next(error);
  }
};
