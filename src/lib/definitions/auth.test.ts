import { describe, it, expect } from 'vitest';
import { RegisterSchema, LoginSchema } from './auth';

describe('Authentication Schemas', () => {
  describe('RegisterSchema', () => {
    it('should validate correct registration data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
        first_name: 'Test',
      };

      const result = RegisterSchema.safeParse(validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123',
        first_name: 'Test',
      };

      const result = RegisterSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid email format');
      }
    });

    it('should reject short password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'short',
        first_name: 'Test',
      };

      const result = RegisterSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Password must be at least 8 characters');
      }
    });

    it('should reject empty first_name', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'password123',
        first_name: '',
      };

      const result = RegisterSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('First name is required');
      }
    });

    it('should reject too long first_name', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'password123',
        first_name: 'a'.repeat(101), // 101 characters
      };

      const result = RegisterSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('First name too long');
      }
    });

    it('should reject missing fields', () => {
      const invalidData = {
        email: 'test@example.com',
        // missing password and first_name
      };

      const result = RegisterSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });
  });

  describe('LoginSchema', () => {
    it('should validate correct login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = LoginSchema.safeParse(validData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123',
      };

      const result = LoginSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid email format');
      }
    });

    it('should reject empty password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '',
      };

      const result = LoginSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Password is required');
      }
    });

    it('should reject missing fields', () => {
      const invalidData = {
        email: 'test@example.com',
        // missing password
      };

      const result = LoginSchema.safeParse(invalidData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });

    it('should accept any password length for login', () => {
      const validData = {
        email: 'test@example.com',
        password: 'a', // Short password should be allowed for login
      };

      const result = LoginSchema.safeParse(validData);

      expect(result.success).toBe(true);
    });
  });

  describe('Type exports', () => {
    it('should export correct types', () => {
      // This test ensures the types are properly exported
      // TypeScript will catch any issues at compile time
      const registerData: import('./auth').RegisterFormData = {
        email: 'test@example.com',
        password: 'password123',
        first_name: 'Test',
      };

      const loginData: import('./auth').LoginFormData = {
        email: 'test@example.com',
        password: 'password123',
      };

      expect(registerData).toBeDefined();
      expect(loginData).toBeDefined();
    });
  });
});
