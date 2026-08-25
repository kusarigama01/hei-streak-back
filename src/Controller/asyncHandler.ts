import type { NextFunction, Request, Response } from "express";
import { AppError } from "../Model/AppError.js";

type Handler = (req: Request, res: Response) => Promise<void>;

export const asyncHandler = (handler: Handler) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await handler(req, res);
    } catch (err) {
      if (err instanceof AppError) {
        res.status(err.statusCode).json({ message: err.message });
        return;
      }
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  };
};