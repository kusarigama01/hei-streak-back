import { findUserByEmail } from "../Repositorie/UserRepository.js";
import { comparePassword } from "../Security/password.js";
import { generateToken } from "../Security/jwt.js";
import { ApiError } from "./ApiError.js";
import type { User } from "../Model/User.js";

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
