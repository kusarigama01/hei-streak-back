import { ApiError } from "./ApiError.js";
import { findExamById, findAvailableExams } from "../Repositorie/ExamRepository.js";
import { findAttemptByStudentExam } from "../Repositorie/AttemptRepository.js";
import { findQuestionsByExamId } from "../Repositorie/QuestionRepository.js";
import type { MyExam, MyExamDetail } from "../Model/StudentExam.js";

export const getStudentExam = async (
    examId: number, studentId: number,
): Promise<MyExamDetail> => {
    const exam = await findExamById(examId);
    if (!exam) throw new ApiError(404, "Exam not found");
    const now = new Date();
    if (now < new Date(exam.starts_at) || now > new Date(exam.ends_at))
      throw new ApiError(403, "Exam is not available");
    const existing = await findAttemptByStudentExam(studentId, examId);
    if (existing) throw new ApiError(403, "Exam already taken");
    const questions = await findQuestionsByExamId(examId);
    return {
      id: exam.id, title: exam.title, description: exam.description,
      course: { code: exam.course.code, name: exam.course.name },
      ends_at: exam.ends_at, question_count: questions.length,
      total_points: questions.reduce((s, q) => s + q.points, 0),
      questions: questions.map(q => ({
        id: q.id, statement: q.statement, points: q.points, position: q.position,
        choices: q.choices.map(c => ({ id: c.id, text: c.text })),
      })),
    };
};

export const getAvailableExams = async (studentId: number): Promise<MyExam[]> => {
  return findAvailableExams(studentId);
};
