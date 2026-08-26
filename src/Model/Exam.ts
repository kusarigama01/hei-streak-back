export interface Exam {
  id: string;
  courseId: string;
  title: string;
  description: string | null;
  startAt: Date;
  endAt: Date;
  createdAt: Date;
  courseName: string;
  courseCode: string;
}

export interface ExamListItem {
  id: string;
  title: string;
  description: string | null;
  courseName: string;
  courseCode: string;
  startAt: Date;
  endAt: Date;
}

export interface StudentExamDTO {
  id: string;
  title: string;
  description: string | null;
  courseName: string;
  courseCode: string;
  startAt: Date;
  endAt: Date;
  questions: StudentQuestionDTO[];
}

export interface StudentQuestionDTO {
  id: string;
  statement: string;
  points: number;
  choices: { id: string; text: string }[];
}
