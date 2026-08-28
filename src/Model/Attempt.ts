export interface Attempt {
    id: number;
    exam_id: number;
    student_id: number;
    submitted_at: Date;
    score: number;
}

export interface AttemptWithDetails {
    id: number;
    exam_id: number;
    title: string;
    course_code: string;
    score: number;
    total_points: number;
    submitted_at: Date;
}
