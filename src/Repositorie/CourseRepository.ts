import { pool } from "../config/db.js";
import type { Course } from "../Model/Course.js";

interface CourseRow {
  id: string;
  code: string;
  name: string;
  description: string | null;
  created_at: Date;
}

const toCourse = (row: CourseRow): Course => ({
  id: row.id,
  code: row.code,
  name: row.name,
  description: row.description,
  createdAt: row.created_at,
});

export const CourseRepository = {
  async findAll(): Promise<Course[]> {
    const result = await pool.query<CourseRow>(
      `SELECT id, code, name, description, created_at FROM courses ORDER BY created_at DESC`
    );
    return result.rows.map(toCourse);
  },

  async findById(id: string): Promise<Course | null> {
    const result = await pool.query<CourseRow>(
      `SELECT id, code, name, description, created_at FROM courses WHERE id = $1`,
      [id]
    );
    return result.rows[0] ? toCourse(result.rows[0]) : null;
  },

  async findByCode(code: string): Promise<Course | null> {
    const result = await pool.query<CourseRow>(
      `SELECT id, code, name, description, created_at FROM courses WHERE code = $1`,
      [code]
    );
    return result.rows[0] ? toCourse(result.rows[0]) : null;
  },

  async create(code: string, name: string, description: string | null): Promise<Course> {
    const result = await pool.query<CourseRow>(
      `INSERT INTO courses (code, name, description) VALUES ($1, $2, $3)
       RETURNING id, code, name, description, created_at`,
      [code, name, description]
    );
    return toCourse(result.rows[0]);
  },

  async update(
    id: string,
    code?: string,
    name?: string,
    description?: string
  ): Promise<Course | null> {
    const result = await pool.query<CourseRow>(
      `UPDATE courses
       SET code = COALESCE($2, code),
           name = COALESCE($3, name),
           description = COALESCE($4, description)
       WHERE id = $1
       RETURNING id, code, name, description, created_at`,
      [id, code ?? null, name ?? null, description ?? null]
    );
    return result.rows[0] ? toCourse(result.rows[0]) : null;
  },

  async delete(id: string): Promise<void> {
    await pool.query(`DELETE FROM courses WHERE id = $1`, [id]);
  },
};