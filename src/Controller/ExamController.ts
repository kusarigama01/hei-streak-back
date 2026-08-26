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
  const { courseId, title, description, startAt, endAt } = req.body;
  if (!courseId || !title || !startAt || !endAt) {
    res
      .status(400)
      .json({ message: "courseId, title, startAt and endAt are required" });
    return;
  }
  const exam = await ExamService.create(courseId, title, description, startAt, endAt);
  res.status(201).json(exam);
});

export const updateExam = asyncHandler(async (req: Request, res: Response) => {
  const { title, description, startAt, endAt } = req.body;
  const exam = await ExamService.update(getIdParam(req), title, description, startAt, endAt);
  res.status(200).json(exam);
});

export const deleteExam = asyncHandler(async (req: Request, res: Response) => {
  await ExamService.remove(getIdParam(req));
  res.status(204).send();
});