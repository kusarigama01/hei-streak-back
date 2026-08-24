import { pool } from "../config/db";
import type { User } from "../Model/User";

export const findUserByEmail = async (email: string): Promise<User | null> => {
  const result = await pool.query(
    "SELECT id, email, password_hash, role, name, is_active, created_at FROM users WHERE email = $1",
    [email],
  );

  const row = result.rows[0];

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    role: row.role,
    name: row.name,
    isActive: row.is_active,
    createdAt: row.created_at,
  };
};
