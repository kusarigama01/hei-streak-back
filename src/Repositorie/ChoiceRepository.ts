import { pool } from "../config/db.js";
import type { Choice } from "../Model/Question.js";

export const replaceChoices = async (
  questionId: number,
  choices: { text: string; is_correct: boolean }[],
): Promise<Choice[]> => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("DELETE FROM choices WHERE question_id = $1", [questionId]);

    const inserted: Choice[] = [];
    for (const choice of choices) {
      const result = await client.query(
        "INSERT INTO choices (question_id, text, is_correct) VALUES ($1, $2, $3) RETURNING id, question_id, text, is_correct",
        [questionId, choice.text, choice.is_correct],
      );
      const row = result.rows[0];
      inserted.push({
        id: row.id,
        question_id: row.question_id,
        text: row.text,
        is_correct: row.is_correct,
      });
    }

    await client.query("COMMIT");
    return inserted;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
