import { pool } from "../config/db.js";
import { ApiError } from "./ApiError.js";
import { findExamById } from "../Repositorie/ExamRepository.js";
import { findAttemptByStudentExam, createAttempt } from "../Repositorie/AttemptRepository.js";
import { findQuestionsByExamId } from "../Repositorie/QuestionRepository.js";
import { createAnswers } from "../Repositorie/AnswerRepository.js";

export interface CorrectionLine {
    question_id: number; statement: string; points: number;
    student_choice_id: number | null; correct_choice_id: number; is_correct: boolean;
}

export interface SubmitResult {
    score: number; total_points: number; correction: CorrectionLine[];
}

export const submitExam = async (
    examId: number, studentId: number,
    answers: { question_id: number; choice_id: number | null }[],
): Promise<SubmitResult> => {
    if (!Array.isArray(answers)) throw new ApiError(400, "answers is required");

    const seen = new Set<number>();
    for (const a of answers) {
      if (seen.has(a.question_id)) throw new ApiError(400, "Duplicate question_id in answers");
      seen.add(a.question_id);
    }

    const exam = await findExamById(examId);
    if (!exam) throw new ApiError(404, "Exam not found");
    const now = new Date();
    if (now < new Date(exam.starts_at) || now > new Date(exam.ends_at))
        throw new ApiError(403, "Exam is not available");
    const existingAttempt = await findAttemptByStudentExam(studentId, examId);
    if (existingAttempt) throw new ApiError(409, "Exam already taken");
    const questions = await findQuestionsByExamId(examId);
    const validQuestionIds = new Set(questions.map(q => q.id));
    const choiceMap = new Map<number, number>(questions.flatMap(q => q.choices.map(c => [c.id, q.id])));
    for (const a of answers) {
        if (!validQuestionIds.has(a.question_id))
          throw new ApiError(400, `Unknown question: ${a.question_id}`);
        if (a.choice_id !== null && choiceMap.get(a.choice_id) !== a.question_id)
          throw new ApiError(400, "choice_id does not belong to its question");
    }
    const answerMap = new Map(answers.map(a => [a.question_id, a.choice_id]));
    let score = 0;
    const correction: CorrectionLine[] = questions.map(q => {
        const studentChoice = answerMap.get(q.id) ?? null;
        const correct = q.choices.find(c => c.is_correct) ?? null;
        const isCorrect =
          studentChoice !== null && correct !== null && studentChoice === correct.id;
        if (isCorrect) score += q.points;
        return {
          question_id: q.id, statement: q.statement, points: q.points,
          student_choice_id: studentChoice,
          correct_choice_id: correct?.id ?? q.id,
          is_correct: isCorrect,
        };
    });
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const attempt = await createAttempt(studentId, examId, score, client);
        await createAnswers(attempt.id, answers, client);
        await client.query("COMMIT");
       const totalPoints = questions.reduce((s, q) => s + q.points, 0);
       return { score, total_points: totalPoints, correction };
     } catch (e) { await client.query("ROLLBACK"); throw e; }
     finally { client.release(); }
 };
