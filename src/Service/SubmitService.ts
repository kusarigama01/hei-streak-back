import { pool } from "../config/db.js";
import { findExamById } from "../Repositorie/ExamRepository.js";
import { findAttemptByStudentExam, createAttempt } from "../Repositorie/AttemptRepository.js";
import { createAnswers } from "../Repositorie/AnswerRepository.js";
import { findQuestionsByExamId } from "../Repositorie/QuestionRepository.js";
import { ApiError } from "./ApiError.js";

export interface SubmitResult {
  attemptId: string;
  score: number;
  totalPoints: number;
  results: {
    questionId: string;
    statement: string;
    yourChoice: string | null;
    correctChoice: string;
    isCorrect: boolean;
    points: number;
  }[];
}

export const submitExam = async (
  examId: string,
  studentId: string,
  answers: { questionId: string; choiceId: string | null }[],
): Promise<SubmitResult> => {
  const exam = await findExamById(examId);
  if (!exam) {
    throw new ApiError(404, "Exam not found");
  }

  const now = new Date();
  if (now < exam.startAt || now > exam.endAt) {
    throw new ApiError(403, "This exam is not currently available");
  }

  const existingAttempt = await findAttemptByStudentExam(studentId, examId);
  if (existingAttempt) {
    throw new ApiError(409, "You have already attempted this exam");
  }

  const questions = await findQuestionsByExamId(examId);
  const questionMap = new Map(questions.map((q) => [q.id, q]));
  let score = 0;

  const detailedResults = answers.map((answer) => {
    const question = questionMap.get(answer.questionId);
    if (!question) {
      throw new ApiError(400, `Unknown question: ${answer.questionId}`);
    }

    const correctChoice = question.choices.find((c) => c.isCorrect);
    const isCorrect = answer.choiceId === correctChoice?.id;
    if (isCorrect) score += question.points;

    return {
      questionId: answer.questionId,
      statement: question.statement,
      yourChoice: answer.choiceId,
      correctChoice: correctChoice?.id ?? "",
      isCorrect,
      points: isCorrect ? question.points : 0,
    };
  });

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const attempt = await createAttempt(studentId, examId, score, client);
    await createAnswers(attempt.id, answers, client);
    await client.query("COMMIT");

    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

    return {
      attemptId: attempt.id,
      score,
      totalPoints,
      results: detailedResults,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
