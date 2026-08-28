import { pool } from "../config/db.js";
import type { Student } from "../Model/Student.js";

interface StudentRow {
  id: number;
  email: string;
  password_hash: string;
  name: string;
  is_active: boolean;
  created_at: Date;
}

function toStudent(row: StudentRow): Student {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    is_active: row.is_active,
    created_at: row.created_at,
  };
}

export const StudentRepository = {
  async findAll(): Promise<Student[]> {
    const result = await pool.query<StudentRow>(
      `SELECT id, email, password_hash, name, is_active, created_at
       FROM users WHERE role = 'student' ORDER BY created_at DESC`
    );
    return result.rows.map(toStudent);
  },

  async findById(id: number): Promise<Student | null> {
    const result = await pool.query<StudentRow>(
      `SELECT id, email, password_hash, name, is_active, created_at
       FROM users WHERE id = $1 AND role = 'student'`,
      [id]
    );
    return result.rows[0] ? toStudent(result.rows[0]) : null;
  },

  async findByEmail(email: string): Promise<StudentRow | null> {
    const result = await pool.query<StudentRow>(
      `SELECT id, email, password_hash, name, is_active, created_at
       FROM users WHERE email = $1`,
      [email]
    );
    return result.rows[0] ?? null;
  },

  async create(email: string, name: string, passwordHash: string): Promise<Student> {
    const result = await pool.query<StudentRow>(
      `INSERT INTO users (email, password_hash, role, name, is_active)
       VALUES ($1, $2, 'student', $3, TRUE)
       RETURNING id, email, password_hash, name, is_active, created_at`,
      [email, passwordHash, name]
    );
    return toStudent(result.rows[0]);
  },

  async update(
    id: number,
    email?: string,
    name?: string,
    passwordHash?: string
  ): Promise<Student | null> {
    const result = await pool.query<StudentRow>(
      `UPDATE users
       SET email = COALESCE($2, email),
           name = COALESCE($3, name),
           password_hash = COALESCE($4, password_hash)
       WHERE id = $1 AND role = 'student'
       RETURNING id, email, password_hash, name, is_active, created_at`,
      [id, email ?? null, name ?? null, passwordHash ?? null]
    );
    return result.rows[0] ? toStudent(result.rows[0]) : null;
  },

  async deactivate(id: number): Promise<Student | null> {
    const result = await pool.query<StudentRow>(
      `UPDATE users SET is_active = FALSE
       WHERE id = $1 AND role = 'student'
       RETURNING id, email, password_hash, name, is_active, created_at`,
      [id]
    );
    return result.rows[0] ? toStudent(result.rows[0]) : null;
  },
};
