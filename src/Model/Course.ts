export interface Course {
    id: number;
    code: string;
    name: string;
    description: string | null;
    created_at: Date;
    exam_count: number;
}
