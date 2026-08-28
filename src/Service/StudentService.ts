import { StudentRepository } from "../Repositorie/StudentRepository.js";
import { hashPassword } from "../Security/password.js";
import { ApiError } from "./ApiError.js";
import type { Student } from "../Model/Student.js";

export const StudentService = {
  async list(): Promise<Student[]> {
    return StudentRepository.findAll();
  },

  async create(email: string, name: string, password: string): Promise<Student> {
    const existing = await StudentRepository.findByEmail(email);
    if (existing) {
      throw new ApiError(409, "Email already in use");
    }
    const passwordHash = await hashPassword(password);
    return StudentRepository.create(email, name, passwordHash);
  },

  // RG: also handles password reset when password is provided
  async update(
    id: number,
    email?: string,
    name?: string,
    password?: string
  ): Promise<Student> {
    if (email) {
      const existing = await StudentRepository.findByEmail(email);
      if (existing && existing.id !== id) {
        throw new ApiError(409, "Email already in use");
      }
    }
    const passwordHash = password ? await hashPassword(password) : undefined;
    const updated = await StudentRepository.update(id, email, name, passwordHash);
    if (!updated) {
      throw new ApiError(404, "Student not found");
    }
    return updated;
  },

  // RG-10: soft delete only, never a hard delete
  async deactivate(id: number): Promise<Student> {
    const updated = await StudentRepository.deactivate(id);
    if (!updated) {
      throw new ApiError(404, "Student not found");
    }
    return updated;
  },
};
