import { StudentRepository } from "../Repositorie/StudentRepository.js";
import { hashPassword } from "../Security/password.js";
import { AppError } from "../Model/AppError.js";
import type { Student } from "../Model/Student.js";

export const StudentService = {
  async list(): Promise<Student[]> {
    return StudentRepository.findAll();
  },

  async create(email: string, name: string, password: string): Promise<Student> {
    const existing = await StudentRepository.findByEmail(email);
    if (existing) {
      throw new AppError(409, "Email already in use");
    }
    const passwordHash = await hashPassword(password);
    return StudentRepository.create(email, name, passwordHash);
  },

  // RG: also handles password reset when password is provided
  async update(
    id: string,
    email?: string,
    name?: string,
    password?: string
  ): Promise<Student> {
    if (email) {
      const existing = await StudentRepository.findByEmail(email);
      if (existing && existing.id !== id) {
        throw new AppError(409, "Email already in use");
      }
    }
    const passwordHash = password ? await hashPassword(password) : undefined;
    const updated = await StudentRepository.update(id, email, name, passwordHash);
    if (!updated) {
      throw new AppError(404, "Student not found");
    }
    return updated;
  },

  // RG-10: soft delete only, never a hard delete
  async deactivate(id: string): Promise<Student> {
    const updated = await StudentRepository.deactivate(id);
    if (!updated) {
      throw new AppError(404, "Student not found");
    }
    return updated;
  },
};