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
