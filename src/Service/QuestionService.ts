import { ApiError } from "./ApiError.js";
import {
  findQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  countAttemptsByExam,
} from "../Repositorie/QuestionRepository.js";
import { replaceChoices } from "../Repositorie/ChoiceRepository.js";
import { findExamById } from "../Repositorie/ExamRepository.js";
import type { QuestionWithChoices } from "../Model/Question.js";

const validateChoices = (choices: { text: string; isCorrect: boolean }[]): void => {
  if (choices.length < 2 || choices.length > 6) {
    throw new ApiError(400, "A question must have between 2 and 6 choices");
  }
  const correctCount = choices.filter((c) => c.isCorrect).length;
  if (correctCount !== 1) {
    throw new ApiError(400, "A question must have exactly 1 correct choice");
  }
};

export const createQuestionWithChoices = async (
  examId: string,
  statement: string,
  points: number,
  choices: { text: string; isCorrect: boolean }[],
): Promise<QuestionWithChoices> => {
  if (!statement || statement.trim() === "") {
    throw new ApiError(400, "Statement is required");
  }
  if (points <= 0) {
    throw new ApiError(400, "Points must be greater than 0");
  }
  validateChoices(choices);

  const exam = await findExamById(examId);
  if (!exam) {
    throw new ApiError(404, "Exam not found");
  }

  const question = await createQuestion(examId, statement.trim(), points);
  const savedChoices = await replaceChoices(question.id, choices);
  return { ...question, choices: savedChoices };
};

export const updateQuestionWithChoices = async (
  questionId: string,
  statement: string,
  points: number,
  choices: { text: string; isCorrect: boolean }[],
): Promise<QuestionWithChoices> => {
  const question = await findQuestionById(questionId);
  if (!question) {
    throw new ApiError(404, "Question not found");
  }

  const attemptCount = await countAttemptsByExam(question.examId);
  if (attemptCount > 0) {
    throw new ApiError(409, "Cannot modify question: attempts already exist for this exam");
  }

  validateChoices(choices);
  const updated = await updateQuestion(questionId, statement.trim(), points);
  const savedChoices = await replaceChoices(questionId, choices);
  return { ...updated!, choices: savedChoices };
};

export const removeQuestion = async (questionId: string): Promise<void> => {
  const question = await findQuestionById(questionId);
  if (!question) {
    throw new ApiError(404, "Question not found");
  }

  const attemptCount = await countAttemptsByExam(question.examId);
  if (attemptCount > 0) {
    throw new ApiError(409, "Cannot delete question: attempts already exist for this exam");
  }

  await deleteQuestion(questionId);
};
