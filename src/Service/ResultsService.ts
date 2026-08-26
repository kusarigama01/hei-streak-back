import { ResultsRepository } from "../Repositorie/ResultsRepository.js";
import { ExamRepository } from "../Repositorie/ExamRepository.js";
import { AppError } from "../Model/AppError.js";

export const ResultsService = {
  async getExamResults(examId: string) {
    const exam = await ExamRepository.findById(examId);
    if (!exam) {
      throw new AppError(404, "Exam not found");
    }
    const [results, stats] = await Promise.all([
      ResultsRepository.getResultsForExam(examId),
      ResultsRepository.getStatsForExam(examId),
    ]);
    return {
      examId: exam.id,
      examTitle: exam.title,
      attemptCount: stats.attemptCount,
      averageScore: stats.averageScore,
      results: results.map((r) => ({
        studentId: r.student_id,
        studentName: r.student_name,
        studentEmail: r.student_email,
        score: r.score,
        submittedAt: r.submitted_at,
      })),
    };
  },
};