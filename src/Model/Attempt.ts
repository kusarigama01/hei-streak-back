export interface Attempt {
  id: string;
  examId: string;
  studentId: string;
  submittedAt: Date;
  score: number;
}

export interface AttemptWithDetails extends Attempt {
  examTitle: string;
  courseName: string | null;
  courseCode: string | null;
  totalPoints: number;
}
