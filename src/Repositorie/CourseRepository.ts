import { pool } from "../config/db.js";
import type { Course } from "../Model/Course.js";

interface CourseRow {
    id: number; code: string; name: string; description: string | null;
    created_at: Date; exam_count: string;
}

const toCourse = (row: CourseRow): Course => ({
    id: row.id, code: row.code, name: row.name, description: row.description,
    created_at: row.created_at, exam_count: Number(row.exam_count),
});

export const CourseRepository = {
  async findAll(): Promise<Course[]> {
    const result = await pool.query<CourseRow>(
      `SELECT c.id, c.code, c.name, c.description, c.created_at,
         COUNT(e.id)::int AS exam_count
       FROM courses c LEFT JOIN exams e ON e.course_id = c.id
       GROUP BY c.id ORDER BY c.created_at DESC`
    );
    return result.rows.map(toCourse);
  },

  async findById(id: number): Promise<Course | null> {
    const result = await pool.query<CourseRow>(
      `SELECT c.id, c.code, c.name, c.description, c.created_at,
         COUNT(e.id)::int AS exam_count
       FROM courses c LEFT JOIN exams e ON e.course_id = c.id
       WHERE c.id = $1 GROUP BY c.id`,
      [id]
    );
    return result.rows[0] ? toCourse(result.rows[0]) : null;
  },

  async findByCode(code: string): Promise<Course | null> {
    const result = await pool.query<CourseRow>(
      `SELECT c.id, c.code, c.name, c.description, c.created_at,
         COUNT(e.id)::int AS exam_count
       FROM courses c LEFT JOIN exams e ON e.course_id = c.id
       WHERE c.code = $1 GROUP BY c.id`,
      [code]
    );
    return result.rows[0] ? toCourse(result.rows[0]) : null;
  },

  async create(code: string, name: string, description: string | null): Promise<Course> {
    const result = await pool.query<{ id: number }>(
      `INSERT INTO courses (code, name, description) VALUES ($1, $2, $3)
       RETURNING id`,
      [code, name, description]
    );
    return (await CourseRepository.findById(result.rows[0].id))!;
  },

  async update(
    id: number,
    code?: string,
    name?: string,
    description?: string
  ): Promise<Course | null> {
    const result = await pool.query<{ id: number }>(
      `UPDATE courses
       SET code = COALESCE($2, code),
           name = COALESCE($3, name),
           description = COALESCE($4, description)
       WHERE id = $1
       RETURNING id`,
      [id, code ?? null, name ?? null, description ?? null]
    );
    return result.rows[0] ? CourseRepository.findById(id) : null;
  },

  async delete(id: number): Promise<void> {
    await pool.query(`DELETE FROM courses WHERE id = $1`, [id]);
  },
};
