import { pool } from "../config/db.js";
import type { Attempt, AttemptWithDetails } from "../Model/Attempt.js";

export const findAttemptByStudentExam = async (
  studentId: string,
  examId: string,
): Promise<Attempt | null> => {
  const result = await pool.query(
    "SELECT id, exam_id, student_id, submitted_at, score FROM attempts WHERE student_id = $1 AND exam_id = $2",
    [studentId, examId],
  );
  const row = result.rows[0];
  if (!row) return null;
  return {
    id: row.id,
    examId: row.exam_id,
    studentId: row.student_id,
    submittedAt: row.submitted_at,
    score: row.score,
  };
};

export const createAttempt = async (
  studentId: string,
  examId: string,
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
    examId: row.exam_id,
    studentId: row.student_id,
    submittedAt: row.submitted_at,
    score: row.score,
  };
};

export const findAttemptsByStudent = async (
  studentId: string,
): Promise<AttemptWithDetails[]> => {
  const result = await pool.query(
    `SELECT a.id, a.exam_id AS "examId", a.student_id AS "studentId",
            a.submitted_at AS "submittedAt", a.score,
            e.title AS "examTitle", c.name AS "courseName", c.code AS "courseCode",
            COALESCE(SUM(q.points), 0) AS "totalPoints"
     FROM attempts a
     JOIN exams e ON e.id = a.exam_id
     JOIN courses c ON c.id = e.course_id
     LEFT JOIN questions q ON q.exam_id = a.exam_id
     WHERE a.student_id = $1
     GROUP BY a.id, e.title, c.name, c.code
     ORDER BY a.submitted_at DESC`,
    [studentId],
  );
  return result.rows.map((row) => ({
    id: row.id,
    examId: row.examId,
    studentId: row.studentId,
    submittedAt: row.submittedAt,
    score: row.score,
    examTitle: row.examTitle,
    courseName: row.courseName,
    courseCode: row.courseCode,
    totalPoints: row.totalPoints,
  }));
};
