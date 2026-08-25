import { pool } from "../config/db.js";

export interface ExamResultRow {
  student_id: string;
  student_name: string;
  student_email: string;
  score: number;
  submitted_at: Date;
}

export const ResultsRepository = {
  async getResultsForExam(examId: string): Promise<ExamResultRow[]> {
    const result = await pool.query<ExamResultRow>(
      `SELECT u.id AS student_id, u.name AS student_name, u.email AS student_email,
              a.score, a.submitted_at
       FROM attempts a
       JOIN users u ON u.id = a.student_id
       WHERE a.exam_id = $1
       ORDER BY a.submitted_at ASC`,
      [examId]
    );
    return result.rows;
  },

  async getStatsForExam(
    examId: string
  ): Promise<{ attemptCount: number; averageScore: number }> {
    const result = await pool.query<{
      attempt_count: string;
      average_score: string | null;
    }>(
      `SELECT COUNT(*) AS attempt_count, AVG(score) AS average_score
       FROM attempts WHERE exam_id = $1`,
      [examId]
    );
    const row = result.rows[0];
    return {
      attemptCount: parseInt(row.attempt_count, 10),
      averageScore: row.average_score ? parseFloat(row.average_score) : 0,
    };
  },
};