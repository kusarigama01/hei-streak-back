import jwt from "jsonwebtoken";
import type { UserRole } from "../Model/User.js";

export interface TokenPayload {
  sub: number;
  role: UserRole;
}

export const generateToken = (payload: TokenPayload): string =>
  jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: Number(process.env.JWT_EXPIRES_IN ?? 3600),
  });

export const verifyToken = (token: string): TokenPayload =>
  jwt.verify(token, process.env.JWT_SECRET as string) as unknown as TokenPayload;
