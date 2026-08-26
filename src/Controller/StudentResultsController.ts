import type { NextFunction, Request, Response } from "express";
import { getStudentResults } from "../Service/StudentResultsService.js";

export const getMyResults = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const results = await getStudentResults(req.user!.sub);
    res.status(200).json(results);
  } catch (error) {
    next(error);
  }
};
