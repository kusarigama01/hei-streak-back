import type { Answer } from "../Model/Answer.js";

export const createAnswers = async (
  attemptId: string,
  answers: { questionId: string; choiceId: string | null }[],
  client: any,
): Promise<void> => {
  for (const answer of answers) {
    await client.query(
      "INSERT INTO answers (attempt_id, question_id, choice_id) VALUES ($1, $2, $3)",
      [attemptId, answer.questionId, answer.choiceId],
    );
  }
};
