import { findExamById, findAvailableExams } from "../Repositorie/ExamRepository.js";
import { findQuestionsByExamId } from "../Repositorie/QuestionRepository.js";
import { findAttemptByStudentExam } from "../Repositorie/AttemptRepository.js";
import { ApiError } from "./ApiError.js";
import type { ExamListItem, StudentExamDTO } from "../Model/StudentExam.js";

export const getAvailableExams = async (studentId: string): Promise<ExamListItem[]> => {
  return findAvailableExams(studentId);
};

export const getStudentExam = async (
  examId: string,
  studentId: string,
): Promise<StudentExamDTO> => {
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
    throw new ApiError(403, "You have already completed this exam");
  }

  const questions = await findQuestionsByExamId(examId);

  return {
    id: exam.id,
    title: exam.title,
    description: exam.description,
    courseName: exam.courseName,
    courseCode: exam.courseCode,
    startAt: exam.startAt,
    endAt: exam.endAt,
    questions: questions.map((q) => ({
      id: q.id,
      statement: q.statement,
      points: q.points,
      choices: q.choices.map((c) => ({ id: c.id, text: c.text })),
    })),
  };
};
