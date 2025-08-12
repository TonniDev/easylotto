import { z } from 'zod';

// User types
export interface User {
  id: string;
  email: string;
  first_name: string;
  is_active: boolean;
  created: Date;
  modified: Date;
}

export interface UserSession {
  id: string;
  user_id: string;
  session_token: string;
  expires_at: Date;
  created: Date;
}

// Request/Response types
export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: Omit<User, 'password_hash'>;
  token?: string;
}

export interface SessionInfo {
  user: Omit<User, 'password_hash'>;
  session: UserSession;
}

// Validation schemas
export const RegisterSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  first_name: z.string().min(1, 'First name is required').max(100, 'First name too long'),
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export type RegisterFormData = z.infer<typeof RegisterSchema>;
export type LoginFormData = z.infer<typeof LoginSchema>;

// JWT payload
export interface JWTPayload {
  userId: string;
  email: string;
  sessionId: string;
  iat?: number;
  exp?: number;
}
