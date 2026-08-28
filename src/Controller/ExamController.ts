import type { Request, Response } from "express";
import { asyncHandler, getIdParam } from "./asyncHandler.js";
import { ExamService } from "../Service/ExamService.js";

export const listExams = asyncHandler(async (_req: Request, res: Response) => {
  const exams = await ExamService.list();
  res.status(200).json(exams);
});

export const getExam = asyncHandler(async (req: Request, res: Response) => {
  const exam = await ExamService.getById(getIdParam(req));
  res.status(200).json(exam);
});

export const createExam = asyncHandler(async (req: Request, res: Response) => {
  const { course_id, title, description, starts_at, ends_at } = req.body;
  if (!course_id || !title || !starts_at || !ends_at) {
    res
      .status(400)
      .json({ message: "course_id, title, starts_at and ends_at are required" });
    return;
  }
  const exam = await ExamService.create(course_id, title, description, starts_at, ends_at);
  res.status(201).json(exam);
});

export const updateExam = asyncHandler(async (req: Request, res: Response) => {
  const { title, description, starts_at, ends_at } = req.body;
  const exam = await ExamService.update(getIdParam(req), title, description, starts_at, ends_at);
  res.status(200).json(exam);
});

export const deleteExam = asyncHandler(async (req: Request, res: Response) => {
  await ExamService.remove(getIdParam(req));
  res.status(200).json({ message: "Exam deleted" });
});
