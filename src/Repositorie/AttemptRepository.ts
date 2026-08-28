import { pool } from "../config/db.js";
import type { Attempt, AttemptWithDetails } from "../Model/Attempt.js";

export const findAttemptByStudentExam = async (
  studentId: number,
  examId: number,
): Promise<Attempt | null> => {
  const result = await pool.query(
    "SELECT id, exam_id, student_id, submitted_at, score FROM attempts WHERE student_id = $1 AND exam_id = $2",
    [studentId, examId],
  );
  const row = result.rows[0];
  if (!row) return null;
  return {
    id: row.id,
    exam_id: row.exam_id,
    student_id: row.student_id,
    submitted_at: row.submitted_at,
    score: row.score,
  };
};

export const createAttempt = async (
  studentId: number,
  examId: number,
  score: number,
  client: any,
): Promise<Attempt> => {
  const result = await client.query(
    "INSERT INTO attempts (student_id, exam_id, score) VALUES ($1, $2, $3) RETURNING id, exam_id, student_id, submitted_at, score",
    [studentId, examId, score],
  );
  const row = result.rows[0];
  return {
    id: row.id,
    exam_id: row.exam_id,
    student_id: row.student_id,
    submitted_at: row.submitted_at,
    score: row.score,
  };
};

export const findAttemptsByStudent = async (
  studentId: number,
): Promise<AttemptWithDetails[]> => {
  const result = await pool.query(
    `SELECT a.id, a.exam_id, a.student_id, a.submitted_at, a.score,
            e.title, c.code AS course_code,
            COALESCE(SUM(q.points), 0)::int AS total_points
     FROM attempts a
     JOIN exams e ON e.id = a.exam_id
     JOIN courses c ON c.id = e.course_id
     LEFT JOIN questions q ON q.exam_id = a.exam_id
     WHERE a.student_id = $1
     GROUP BY a.id, a.exam_id, a.student_id, a.submitted_at, a.score, e.title, c.code
     ORDER BY a.submitted_at DESC`,
    [studentId],
  );
  return result.rows.map((row) => ({
    id: row.id,
    exam_id: row.exam_id,
    title: row.title,
    course_code: row.course_code,
    score: row.score,
    total_points: row.total_points,
    submitted_at: row.submitted_at,
  }));
};
