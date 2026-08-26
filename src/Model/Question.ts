export interface Question {
  id: string;
  examId: string;
  statement: string;
  points: number;
  createdAt: Date;
}

export interface Choice {
  id: string;
  questionId: string;
  text: string;
  isCorrect: boolean;
}

export interface QuestionWithChoices extends Question {
  choices: Choice[];
}
