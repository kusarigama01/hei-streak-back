import type { Request, Response } from "express";
import { asyncHandler, getIdParam } from "./asyncHandler.js";
import { ResultsService } from "../Service/ResultsService.js";

export const getExamResults = asyncHandler(async (req: Request, res: Response) => {
  const data = await ResultsService.getExamResults(getIdParam(req));
  res.status(200).json(data);
});