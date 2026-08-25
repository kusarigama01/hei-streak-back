import { findAttemptsByStudent } from "../Repositorie/AttemptRepository.js";
import type { AttemptWithDetails } from "../Model/Attempt.js";

export const getStudentResults = async (studentId: string): Promise<AttemptWithDetails[]> => {
  return findAttemptsByStudent(studentId);
};
