import { findAttemptsByStudent } from "../Repositorie/AttemptRepository.js";
import type { AttemptWithDetails } from "../Model/Attempt.js";

export const getStudentResults = async (studentId: number): Promise<AttemptWithDetails[]> => {
  return findAttemptsByStudent(studentId);
};
