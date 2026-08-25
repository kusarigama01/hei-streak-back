import { pool } from "../config/db.js";
import type { Exam } from "../Model/Exam.js";

interface ExamRow {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  start_at: Date;
  end_at: Date;
  created_at: Date;
}

const toExam = (row: ExamRow): Exam => ({
  id: row.id,
  courseId: row.course_id,
  title: row.title,
  description: row.description,
  startAt: row.start_at,
  endAt: row.end_at,
  createdAt: row.created_at,
});

export const ExamRepository = {
  async findAll(): Promise<Exam[]> {
    const result = await pool.query<ExamRow>(
      `SELECT id, course_id, title, description, start_at, end_at, created_at
       FROM exams ORDER BY start_at DESC`
    );
    return result.rows.map(toExam);
  },

  async findById(id: string): Promise<Exam | null> {
    const result = await pool.query<ExamRow>(
      `SELECT id, course_id, title, description, start_at, end_at, created_at
       FROM exams WHERE id = $1`,
      [id]
    );
    return result.rows[0] ? toExam(result.rows[0]) : null;
  },

  async create(
    courseId: string,
    title: string,
    description: string | null,
    startAt: string,
    endAt: string
  ): Promise<Exam> {
    const result = await pool.query<ExamRow>(
      `INSERT INTO exams (course_id, title, description, start_at, end_at)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, course_id, title, description, start_at, end_at, created_at`,
      [courseId, title, description, startAt, endAt]
    );
    return toExam(result.rows[0]);
  },

  async update(
    id: string,
    title?: string,
    description?: string,
    startAt?: string,
    endAt?: string
  ): Promise<Exam | null> {
    const result = await pool.query<ExamRow>(
      `UPDATE exams
       SET title = COALESCE($2, title),
           description = COALESCE($3, description),
           start_at = COALESCE($4, start_at),
           end_at = COALESCE($5, end_at)
       WHERE id = $1
       RETURNING id, course_id, title, description, start_at, end_at, created_at`,
      [id, title ?? null, description ?? null, startAt ?? null, endAt ?? null]
    );
    return result.rows[0] ? toExam(result.rows[0]) : null;
  },

  async delete(id: string): Promise<void> {
    await pool.query(`DELETE FROM exams WHERE id = $1`, [id]);
  },
};