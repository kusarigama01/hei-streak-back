export interface Attempt {
  id: string;
  examId: string;
  studentId: string;
  submittedAt: Date;
  score: number;
}

export interface AttemptWithDetails extends Attempt {
  examTitle: string;
  courseName: string;
  courseCode: string;
  totalPoints: number;
}
