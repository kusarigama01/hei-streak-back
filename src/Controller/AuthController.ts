import type { NextFunction, Request, Response } from "express";
import { login } from "../Service/AuthService.js";
import { ApiError } from "../Service/ApiError.js";

export const postLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      email.trim() === "" ||
      password === ""
    ) {
      throw new ApiError(400, "Email and password are required");
    }

    const result = await login(email, password);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
