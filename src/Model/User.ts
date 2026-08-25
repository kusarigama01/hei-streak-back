export type UserRole = "admin" | "student";

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  name: string;
  isActive: boolean;
  createdAt: Date;
}
