import { pool } from "../config/db.js";
import { ExamRepository } from "../Repositorie/ExamRepository.js";
import { ResultsRepository } from "../Repositorie/ResultsRepository.js";
import { ApiError } from "./ApiError.js";

export const ResultsService = {
  async getExamResults(examId: number) {
      const exam = await ExamRepository.findById(examId);
      if (!exam) throw new ApiError(404, "Exam not found");
      const [results, stats, totalPoints] = await Promise.all([
        ResultsRepository.getResultsForExam(examId),
        ResultsRepository.getStatsForExam(examId),
        pool.query("SELECT COALESCE(SUM(points),0)::int AS total FROM questions WHERE exam_id=$1", [examId]),
      ]);
      return {
        exam: { id: exam.id, title: exam.title },
        total_points: totalPoints.rows[0].total,
        average: stats.attemptCount > 0 ? Number(stats.averageScore.toFixed(2)) : null,
        attempt_count: stats.attemptCount,
        results: results.map(r => ({
            student_id: r.student_id, name: r.name,
            score: r.score, submitted_at: r.submitted_at,
        })),
      };
  },
};
