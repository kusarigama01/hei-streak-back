import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../Service/ApiError.js";

type Handler = (req: Request, res: Response) => Promise<void>;

export const asyncHandler = (handler: Handler) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await handler(req, res);
    } catch (err) {
      if (err instanceof ApiError) {
        res.status(err.status).json({ message: err.message });
        return;
      }
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  };
};

export const getIdParam = (req: Request): number => {
    const n = Number(req.params.id);
    if (!Number.isInteger(n) || n <= 0)
        throw new ApiError(400, "Invalid id parameter");
    return n;
};
