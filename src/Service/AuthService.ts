import { findUserByEmail } from "../Repositorie/UserRepository";
import { comparePassword } from "../Security/password";
import { generateToken } from "../Security/jwt";
import { ApiError } from "./ApiError";
import type { User } from "../Model/User";

export interface LoginResult {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: User["role"];
  };
}

export const login = async (email: string, password: string): Promise<LoginResult> => {
  const user = await findUserByEmail(email.trim().toLowerCase());

  if (!user || !(await comparePassword(password, user.passwordHash))) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (!user.isActive) {
    throw new ApiError(403, "Account is deactivated");
  }

  return {
    token: generateToken({ sub: user.id, role: user.role }),
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
};
