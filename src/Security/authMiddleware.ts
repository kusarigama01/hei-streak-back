import type { NextFunction, Request, Response } from "express";
import type { UserRole } from "../Model/User.js";
import { verifyToken } from "./jwt.js";

declare global {
  namespace Express {
    interface Request {
      user?: { sub: string; role: UserRole };
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  try {
    req.user = verifyToken(header.slice(7));
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const requireRole =
  (...roles: UserRole[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ message: "Insufficient permissions" });
      return;
    }

    next();
  };
