import { pool } from "../config/db.js";
import type { User } from "../Model/User.js";

export const findUserByEmail = async (email: string): Promise<User | null> => {
    const result = await pool.query(
      "SELECT id, email, password_hash, role, name, is_active, created_at FROM users WHERE email = $1",
      [email],
    );
    return result.rows[0] ?? null;
};
