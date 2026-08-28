import { pool } from "../config/db.js";
import type { Exam } from "../Model/Exam.js";
import type { MyExam } from "../Model/StudentExam.js";

interface ExamRow {
  id: number;
  title: string;
  description: string | null;
  start_at: Date;
  end_at: Date;
  created_at: Date;
  course_id: number;
  course_code: string;
  course_name: string;
  question_count: number;
  attempt_count: number;
}

function toExam(row: ExamRow): Exam {
  return {
    id: row.id,
    course: { id: row.course_id, code: row.course_code, name: row.course_name },
    title: row.title, description: row.description,
    starts_at: row.start_at, ends_at: row.end_at, created_at: row.created_at,
    question_count: row.question_count, attempt_count: row.attempt_count,
  };
}

const examSelect = `
  SELECT e.id, e.title, e.description, e.start_at, e.end_at, e.created_at,
         c.id AS course_id, c.code AS course_code, c.name AS course_name,
         (SELECT COUNT(*) FROM questions q WHERE q.exam_id = e.id)::int AS question_count,
         (SELECT COUNT(*) FROM attempts a WHERE a.exam_id = e.id)::int AS attempt_count
  FROM exams e
  JOIN courses c ON c.id = e.course_id`;

export const findExamById = async (id: number): Promise<Exam | null> => {
  const result = await pool.query<ExamRow>(
    `${examSelect}
     WHERE e.id = $1`,
    [id],
  );
  return result.rows[0] ? toExam(result.rows[0]) : null;
};

export const findAllExams = async (): Promise<Exam[]> => {
  const result = await pool.query<ExamRow>(
    `${examSelect}
     ORDER BY e.created_at DESC`,
  );
  return result.rows.map(toExam);
};

export const createExam = async (
  courseId: number,
  title: string,
  description: string | null,
  startAt: string,
  endAt: string,
): Promise<Exam> => {
  const result = await pool.query<{ id: number }>(
    `INSERT INTO exams (course_id, title, description, start_at, end_at)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [courseId, title, description, startAt, endAt],
  );
  const newExam = await findExamById(result.rows[0].id);
  return newExam!;
};

export const updateExam = async (
  id: number,
  title?: string,
  description?: string,
  startAt?: string,
  endAt?: string,
): Promise<Exam | null> => {
  const result = await pool.query<{ id: number }>(
    `UPDATE exams
     SET title = COALESCE($1, title),
         description = COALESCE($2, description),
         start_at = COALESCE($3, start_at),
         end_at = COALESCE($4, end_at)
     WHERE id = $5
     RETURNING id`,
    [title ?? null, description ?? null, startAt ?? null, endAt ?? null, id],
  );

  if (result.rowCount === 0) return null;
  return findExamById(id);
};

export const deleteExam = async (id: number): Promise<void> => {
  await pool.query(`DELETE FROM exams WHERE id = $1`, [id]);
};

export const findAvailableExams = async (studentId: number): Promise<MyExam[]> => {
  const result = await pool.query(
    `SELECT e.id, e.title, e.description, e.end_at AS ends_at,
            c.code AS course_code, c.name AS course_name,
            (SELECT COUNT(*) FROM questions q WHERE q.exam_id = e.id)::int AS question_count,
            COALESCE((SELECT SUM(points) FROM questions q WHERE q.exam_id = e.id), 0)::int AS total_points
     FROM exams e
     JOIN courses c ON c.id = e.course_id
     WHERE now() BETWEEN e.start_at AND e.end_at
       AND NOT EXISTS (SELECT 1 FROM attempts a WHERE a.exam_id = e.id AND a.student_id = $1)
     ORDER BY e.start_at`,
    [studentId],
  );
  return result.rows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    course: { code: row.course_code, name: row.course_name },
    ends_at: row.ends_at,
    question_count: row.question_count,
    total_points: row.total_points,
  }));
};

export const ExamRepository = {
  findAll: findAllExams,
  findById: findExamById,
  create: createExam,
  update: updateExam,
  delete: deleteExam,
  findAvailableExams,
};
