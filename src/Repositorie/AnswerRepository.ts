export const createAnswers = async (
  attemptId: number,
  answers: { question_id: number; choice_id: number | null }[],
  client: any,
): Promise<void> => {
  for (const a of answers) {
      await client.query(
        "INSERT INTO answers (attempt_id, question_id, choice_id) VALUES ($1,$2,$3)",
        [attemptId, a.question_id, a.choice_id],
      );
  }
};
