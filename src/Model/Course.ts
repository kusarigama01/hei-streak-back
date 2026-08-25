export interface Course {
  id: string;
  code: string;
  name: string;
  description: string | null;
  createdAt: Date;
}