export interface Choice {
    id: number;
    question_id: number;
    text: string;
    is_correct: boolean;
}

export interface Question {
    id: number;
    exam_id: number;
    statement: string;
    points: number;
    position: number;
    created_at: Date;
}

export interface QuestionWithChoices extends Question {
    choices: Choice[];
}
