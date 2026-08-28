export interface MyExamCourse { code: string; name: string; }

export interface MyExam {
    id: number;
    title: string;
    course: MyExamCourse;
    description: string | null;
    ends_at: Date;
    question_count: number;
    total_points: number;
}

export interface StudentQuestionDTO {
    id: number;
    statement: string;
    points: number;
    position: number;
    choices: { id: number; text: string }[];
}

export interface MyExamDetail extends MyExam {
    questions: StudentQuestionDTO[];
}
