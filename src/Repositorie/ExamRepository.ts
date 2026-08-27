import { pool } from "../config/db.js";
import type { Exam } from "../Model/Exam.js";
import type { ExamListItem } from "../Model/StudentExam.js";

export const findExamById = async (id: string): Promise<Exam | null> => {
  const result = await pool.query(
    `SELECT e.id, e.course_id, e.title, e.description, e.start_at, e.end_at, e.created_at,
            c.name AS "courseName", c.code AS "courseCode"
     FROM exams e
     JOIN courses c ON c.id = e.course_id
     WHERE e.id = $1`,
    [id],
  );
  const row = result.rows[0];
  if (!row) return null;
  return {
    id: row.id,
    courseId: row.course_id,
    title: row.title,
    description: row.description,
    startAt: row.start_at,
    endAt: row.end_at,
    createdAt: row.created_at,
    courseName: row.courseName,
    courseCode: row.courseCode,
  };
};

export const findAllExams = async (): Promise<Exam[]> => {
  const result = await pool.query(
    `SELECT e.id, e.course_id, e.title, e.description, e.start_at, e.end_at, e.created_at,
            c.name AS "courseName", c.code AS "courseCode"
     FROM exams e
     JOIN courses c ON c.id = e.course_id
     ORDER BY e.created_at DESC`,
  );
  return result.rows.map((row) => ({
    id: row.id,
    courseId: row.course_id,
    title: row.title,
    description: row.description,
    startAt: row.start_at,
    endAt: row.end_at,
    createdAt: row.created_at,
    courseName: row.courseName,
    courseCode: row.courseCode,
  }));
};

export const createExam = async (
  courseId: string,
  title: string,
  description: string | null,
  startAt: string,
  endAt: string,
): Promise<Exam> => {
  const result = await pool.query(
    `INSERT INTO exams (course_id, title, description, start_at, end_at)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [courseId, title, description, startAt, endAt],
  );
  const newExam = await findExamById(result.rows[0].id);
  return newExam!;
};

export const updateExam = async (
  id: string,
  title?: string,
  description?: string,
  startAt?: string,
  endAt?: string,
): Promise<Exam | null> => {
  const result = await pool.query(
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

export const deleteExam = async (id: string): Promise<void> => {
  await pool.query(`DELETE FROM exams WHERE id = $1`, [id]);
};

export const findAvailableExams = async (studentId: string): Promise<ExamListItem[]> => {
  const result = await pool.query(
    `SELECT e.id, e.title, e.description,
            c.name AS "courseName", c.code AS "courseCode",
            e.start_at AS "startAt", e.end_at AS "endAt"
     FROM exams e
     JOIN courses c ON c.id = e.course_id
     WHERE now() BETWEEN e.start_at AND e.end_at
       AND NOT EXISTS (
         SELECT 1 FROM attempts a WHERE a.exam_id = e.id AND a.student_id = $1
       )
     ORDER BY e.start_at`,
    [studentId],
  );
  return result.rows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    courseName: row.courseName,
    courseCode: row.courseCode,
    startAt: row.startAt,
    endAt: row.endAt,
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