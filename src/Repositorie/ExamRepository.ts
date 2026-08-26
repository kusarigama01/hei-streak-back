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
