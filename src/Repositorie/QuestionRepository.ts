import { pool } from "../config/db.js";
import type { Question, QuestionWithChoices } from "../Model/Question.js";

export const findQuestionById = async (id: number): Promise<Question | null> => {
  const result = await pool.query(
    "SELECT id, exam_id, statement, points, position, created_at FROM questions WHERE id = $1",
    [id],
  );
  const row = result.rows[0];
  if (!row) return null;
  return {
    id: row.id,
    exam_id: row.exam_id,
    statement: row.statement,
    points: row.points,
    position: row.position,
    created_at: row.created_at,
  };
};

export const findQuestionsByExamId = async (examId: number): Promise<QuestionWithChoices[]> => {
  const questionsResult = await pool.query(
    "SELECT id, exam_id, statement, points, position, created_at FROM questions WHERE exam_id = $1 ORDER BY position",
    [examId],
  );

  if (questionsResult.rows.length === 0) return [];

  const choicesResult = await pool.query(
    "SELECT id, question_id, text, is_correct FROM choices WHERE question_id = ANY($1::int[]) ORDER BY id",
    [questionsResult.rows.map((r) => r.id)],
  );

  const choicesByQuestion = new Map<number, { id: number; question_id: number; text: string; is_correct: boolean }[]>();
  for (const row of choicesResult.rows) {
    const list = choicesByQuestion.get(row.question_id) ?? [];
    list.push({ id: row.id, question_id: row.question_id, text: row.text, is_correct: row.is_correct });
    choicesByQuestion.set(row.question_id, list);
  }

  return questionsResult.rows.map((row) => ({
    id: row.id,
    exam_id: row.exam_id,
    statement: row.statement,
    points: row.points,
    position: row.position,
    created_at: row.created_at,
    choices: choicesByQuestion.get(row.id) ?? [],
  }));
};

export const createQuestion = async (examId: number, statement: string, points: number): Promise<Question> => {
  const result = await pool.query(
    `INSERT INTO questions (exam_id, statement, points, position)
     VALUES ($1, $2, $3, (SELECT COALESCE(MAX(position), 0) FROM questions WHERE exam_id = $1) + 1)
     RETURNING id, exam_id, statement, points, position, created_at`,
    [examId, statement, points],
  );
  const row = result.rows[0];
  return {
    id: row.id,
    exam_id: row.exam_id,
    statement: row.statement,
    points: row.points,
    position: row.position,
    created_at: row.created_at,
  };
};

export const updateQuestion = async (
  id: number,
  statement: string,
  points: number,
  position?: number,
): Promise<Question | null> => {
  const result = await pool.query(
    `UPDATE questions
     SET statement = $1, points = $2, position = COALESCE($4, position)
     WHERE id = $3
     RETURNING id, exam_id, statement, points, position, created_at`,
    [statement, points, id, position ?? null],
  );
  const row = result.rows[0];
  if (!row) return null;
  return {
    id: row.id,
    exam_id: row.exam_id,
    statement: row.statement,
    points: row.points,
    position: row.position,
    created_at: row.created_at,
  };
};

export const deleteQuestion = async (id: number): Promise<boolean> => {
  const result = await pool.query("DELETE FROM questions WHERE id = $1", [id]);
  return (result.rowCount ?? 0) > 0;
};

export const countAttemptsByExam = async (examId: number): Promise<number> => {
  const result = await pool.query("SELECT COUNT(*)::int AS count FROM attempts WHERE exam_id = $1", [examId]);
  return result.rows[0].count;
};
