import { CourseRepository } from "../Repositorie/CourseRepository.js";
import { ApiError } from "./ApiError.js";
import type { Course } from "../Model/Course.js";

interface PgError extends Error {
  code?: string;
}

export const CourseService = {
  async list(): Promise<Course[]> {
    return CourseRepository.findAll();
  },

  async create(code: string, name: string, description?: string): Promise<Course> {
    const existing = await CourseRepository.findByCode(code);
    if (existing) {
      throw new ApiError(409, "Course code already exists");
    }
    return CourseRepository.create(code, name, description ?? null);
  },

  async update(
    id: number,
    code?: string,
    name?: string,
    description?: string
  ): Promise<Course> {
    const current = await CourseRepository.findById(id);
    if (!current) {
      throw new ApiError(404, "Course not found");
    }
    if (code) {
      const existing = await CourseRepository.findByCode(code);
      if (existing && existing.id !== id) {
        throw new ApiError(409, "Course code already exists");
      }
    }
    const updated = await CourseRepository.update(id, code, name, description);
    if (!updated) {
      throw new ApiError(404, "Course not found");
    }
    return updated;
  },

  // RG-09: cannot delete a course with linked exams
  async remove(id: number): Promise<void> {
    const current = await CourseRepository.findById(id);
    if (!current) {
      throw new ApiError(404, "Course not found");
    }
    try {
      await CourseRepository.delete(id);
    } catch (err) {
      const pgErr = err as PgError;
      if (pgErr.code === "23503") {
        throw new ApiError(409, "Cannot delete course: exams are linked to it");
      }
      throw err;
    }
  },
};
