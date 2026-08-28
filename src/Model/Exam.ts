export interface ExamCourse { id: number; code: string; name: string; }

export interface Exam {
    id: number;
    course: ExamCourse;
    title: string;
    description: string | null;
    starts_at: Date;
    ends_at: Date;
    created_at: Date;
    question_count: number;
    attempt_count: number;
}
