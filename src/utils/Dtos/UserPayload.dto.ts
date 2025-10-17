export interface UserPaylodDto {
    sub: number;
    email: string;
    userRole: 'STUDENT' | 'TEACHER' | 'ADMIN';
}