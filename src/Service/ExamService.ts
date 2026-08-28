import { ExamRepository } from "../Repositorie/ExamRepository.js";
import { CourseRepository } from "../Repositorie/CourseRepository.js";
import { ApiError } from "./ApiError.js";
import type { Exam } from "../Model/Exam.js";

interface PgError extends Error {
  code?: string;
}

const validateWindow = (startAt: string, endAt: string): void => {
  if (new Date(endAt) <= new Date(startAt)) {
    throw new ApiError(400, "End date must be after start date");
  }
};

export const ExamService = {
  async list(): Promise<Exam[]> {
    return ExamRepository.findAll();
  },

  async getById(id: number): Promise<Exam> {
    const exam = await ExamRepository.findById(id);
    if (!exam) {
      throw new ApiError(404, "Exam not found");
    }
    return exam;
  },

  async create(
    courseId: number,
    title: string,
    description: string | undefined,
    startsAt: string,
    endsAt: string
  ): Promise<Exam> {
    if (!Number.isInteger(courseId) || courseId <= 0)
      throw new ApiError(400, "Invalid course_id");
    const course = await CourseRepository.findById(courseId);
    if (!course) throw new ApiError(404, "Course not found");
    validateWindow(startsAt, endsAt);
    return ExamRepository.create(courseId, title, description ?? null, startsAt, endsAt);
  },

  async update(
    id: number,
    title?: string,
    description?: string,
    startsAt?: string,
    endsAt?: string
  ): Promise<Exam> {
    const current = await ExamRepository.findById(id);
    if (!current) {
      throw new ApiError(404, "Exam not found");
    }
    const finalStart = startsAt ?? current.starts_at.toISOString();
    const finalEnd = endsAt ?? current.ends_at.toISOString();
    validateWindow(finalStart, finalEnd);
    const updated = await ExamRepository.update(id, title, description, startsAt, endsAt);
    if (!updated) {
      throw new ApiError(404, "Exam not found");
    }
    return updated;
  },

  async remove(id: number): Promise<void> {
    const current = await ExamRepository.findById(id);
    if (!current) {
      throw new ApiError(404, "Exam not found");
    }
    try {
      await ExamRepository.delete(id);
    } catch (err) {
      const pgErr = err as PgError;
      if (pgErr.code === "23503") {
        throw new ApiError(409, "Cannot delete exam: attempts are recorded for it");
      }
      throw err;
    }
  },
};
