import { ExamRepository } from "../Repositorie/ExamRepository.js";
import { CourseRepository } from "../Repositorie/CourseRepository.js";
import { AppError } from "../Model/AppError.js";
import type { Exam } from "../Model/Exam.js";

interface PgError extends Error {
  code?: string;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const validateWindow = (startAt: string, endAt: string): void => {
  if (new Date(endAt) <= new Date(startAt)) {
    throw new AppError(400, "endAt must be after startAt");
  }
};

export const ExamService = {
  async list(): Promise<Exam[]> {
    return ExamRepository.findAll();
  },

  async getById(id: string): Promise<Exam> {
    const exam = await ExamRepository.findById(id);
    if (!exam) {
      throw new AppError(404, "Exam not found");
    }
    return exam;
  },

  async create(
    courseId: string,
    title: string,
    description: string | undefined,
    startAt: string,
    endAt: string
  ): Promise<Exam> {
    if (!UUID_REGEX.test(courseId)) {
      throw new AppError(400, "Invalid courseId format");
    }
    const course = await CourseRepository.findById(courseId);
    if (!course) {
      throw new AppError(404, "Course not found");
    }
    validateWindow(startAt, endAt);
    return ExamRepository.create(courseId, title, description ?? null, startAt, endAt);
  },

  async update(
    id: string,
    title?: string,
    description?: string,
    startAt?: string,
    endAt?: string
  ): Promise<Exam> {
    const current = await ExamRepository.findById(id);
    if (!current) {
      throw new AppError(404, "Exam not found");
    }
    const finalStart = startAt ?? current.startAt.toISOString();
    const finalEnd = endAt ?? current.endAt.toISOString();
    validateWindow(finalStart, finalEnd);
    const updated = await ExamRepository.update(id, title, description, startAt, endAt);
    if (!updated) {
      throw new AppError(404, "Exam not found");
    }
    return updated;
  },

  async remove(id: string): Promise<void> {
    const current = await ExamRepository.findById(id);
    if (!current) {
      throw new AppError(404, "Exam not found");
    }
    try {
      await ExamRepository.delete(id);
    } catch (err) {
      const pgErr = err as PgError;
      if (pgErr.code === "23503") {
        throw new AppError(409, "Cannot delete exam: attempts are recorded for it");
      }
      throw err;
    }
  },
};