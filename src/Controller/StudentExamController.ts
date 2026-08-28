import type { NextFunction, Request, Response } from "express";
import { getAvailableExams, getStudentExam } from "../Service/StudentExamService.js";

export const getMyExams = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const exams = await getAvailableExams(req.user!.sub);
    res.status(200).json(exams);
  } catch (error) {
    next(error);
  }
};

export const getMyExamDetail = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const exam = await getStudentExam(Number(req.params.id), req.user!.sub);
    res.status(200).json(exam);
  } catch (error) {
    next(error);
  }
};
