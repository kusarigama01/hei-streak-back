export type UserRole = "admin" | "student";

export interface User {
    id: number;
    email: string;
    password_hash: string;
    role: UserRole;
    name: string;
    is_active: boolean;
    created_at: Date;
}
