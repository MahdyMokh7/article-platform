/**
 * Validators Unit Tests
 *
 * Tests for all form validation functions
 *
 * @module utils/validators.test
 */

import { describe, it, expect } from 'vitest';
import {
  validateUsername,
  validateEmail,
  validatePhone,
  validatePassword,
  validateConfirmPassword,
  validateLogin,
  validateRegistration,
  validateProfile,
  validatePasswordChange,
} from '../validators';

describe('validateUsername', () => {
  it('should return error for empty username', () => {
    expect(validateUsername('')).toBe('Username is required');
    expect(validateUsername('   ')).toBe('Username is required');
  });

  it('should return error for username shorter than 3 characters', () => {
    expect(validateUsername('ab')).toBe('Username must be at least 3 characters');
  });

  it('should return error for username longer than 50 characters', () => {
    const longUsername = 'a'.repeat(51);
    expect(validateUsername(longUsername)).toBe('Username must be less than 50 characters');
  });

  it('should return error for invalid characters', () => {
    expect(validateUsername('user@name')).toBe('Username can only contain letters, numbers, and underscores');
    expect(validateUsername('user name')).toBe('Username can only contain letters, numbers, and underscores');
  });

  it('should return null for valid usernames', () => {
    expect(validateUsername('john_doe')).toBeNull();
    expect(validateUsername('johndoe123')).toBeNull();
    expect(validateUsername('JOHN_DOE')).toBeNull();
  });
});

describe('validateEmail', () => {
  it('should return error for empty email', () => {
    expect(validateEmail('')).toBe('Email is required');
    expect(validateEmail('   ')).toBe('Email is required');
  });

  it('should return error for invalid email format', () => {
    expect(validateEmail('invalid')).toBe('Invalid email format');
    expect(validateEmail('invalid@')).toBe('Invalid email format');
    expect(validateEmail('invalid@domain')).toBe('Invalid email format');
    expect(validateEmail('invalid@domain.')).toBe('Invalid email format');
  });

  it('should return null for valid emails', () => {
    expect(validateEmail('test@example.com')).toBeNull();
    expect(validateEmail('user.name@domain.co')).toBeNull();
    expect(validateEmail('user+tag@domain.org')).toBeNull();
  });
});

describe('validatePhone', () => {
  it('should return null for empty phone (optional)', () => {
    expect(validatePhone('')).toBeNull();
    expect(validatePhone('   ')).toBeNull();
  });

  it('should return error for invalid phone format', () => {
    expect(validatePhone('123')).toBe('Invalid phone format (e.g., +989123456789)');
    expect(validatePhone('+123')).toBe('Invalid phone format (e.g., +989123456789)');
    expect(validatePhone('1234567890123456')).toBe('Invalid phone format (e.g., +989123456789)');
    expect(validatePhone('abc123')).toBe('Invalid phone format (e.g., +989123456789)');
  });

  it('should return null for valid phone formats', () => {
    expect(validatePhone('+989123456789')).toBeNull();
    expect(validatePhone('+11234567890')).toBeNull();
    expect(validatePhone('1234567890')).toBeNull();
  });
});

describe('validatePassword', () => {
  it('should return error for empty password', () => {
    expect(validatePassword('')).toBe('Password is required');
  });

  it('should return error for password shorter than 6 characters', () => {
    expect(validatePassword('Abc12')).toBe('Password must be at least 6 characters');
  });

  it('should return error for missing lowercase letter', () => {
    expect(validatePassword('ABCDEF123')).toBe('Must contain a lowercase letter');
  });

  it('should return error for missing uppercase letter', () => {
    expect(validatePassword('abcdef123')).toBe('Must contain an uppercase letter');
  });

  it('should return error for missing number', () => {
    expect(validatePassword('Abcdefgh')).toBe('Must contain a number');
  });

  it('should return null for valid passwords', () => {
    expect(validatePassword('SecurePass123')).toBeNull();
    expect(validatePassword('Abcdef123')).toBeNull();
    expect(validatePassword('P@ssw0rd')).toBeNull();
  });
});

describe('validateConfirmPassword', () => {
  it('should return error for empty confirmation', () => {
    expect(validateConfirmPassword('Secure123', '')).toBe('Please confirm your password');
  });

  it('should return error when passwords do not match', () => {
    expect(validateConfirmPassword('Secure123', 'WrongPass')).toBe('Passwords do not match');
  });

  it('should return null when passwords match', () => {
    expect(validateConfirmPassword('Secure123', 'Secure123')).toBeNull();
  });
});

describe('validateLogin', () => {
  it('should return errors for empty fields', () => {
    const errors = validateLogin({ username: '', password: '' });
    expect(errors.username).toBe('Username is required');
    expect(errors.password).toBe('Password is required');
  });

  it('should return errors for invalid username and password', () => {
    const errors = validateLogin({ username: 'ab', password: 'Abc12' });
    expect(errors.username).toBe('Username must be at least 3 characters');
    expect(errors.password).toBe('Password must be at least 6 characters');
  });

  it('should return empty object for valid login data', () => {
    const errors = validateLogin({ username: 'john_doe', password: 'SecurePass123' });
    expect(errors).toEqual({});
  });
});

describe('validateRegistration', () => {
  it('should return errors for empty fields', () => {
    const errors = validateRegistration({
      username: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    });
    expect(errors.username).toBe('Username is required');
    expect(errors.email).toBe('Email is required');
    expect(errors.password).toBe('Password is required');
    expect(errors.confirmPassword).toBe('Please confirm your password');
  });

  it('should return errors for invalid data', () => {
    const errors = validateRegistration({
      username: 'ab',
      email: 'invalid',
      phone: '123',
      password: 'abc123',
      confirmPassword: 'abc124',
    });
    expect(errors.username).toBe('Username must be at least 3 characters');
    expect(errors.email).toBe('Invalid email format');
    expect(errors.phone).toBe('Invalid phone format (e.g., +989123456789)');
    expect(errors.password).toBe('Must contain an uppercase letter');
    expect(errors.confirmPassword).toBe('Passwords do not match');
  });

  it('should return empty object for valid registration data', () => {
    const errors = validateRegistration({
      username: 'john_doe',
      email: 'john@example.com',
      phone: '+989123456789',
      password: 'SecurePass123',
      confirmPassword: 'SecurePass123',
    });
    expect(errors).toEqual({});
  });

  it('should allow empty phone number', () => {
    const errors = validateRegistration({
      username: 'john_doe',
      email: 'john@example.com',
      phone: '',
      password: 'SecurePass123',
      confirmPassword: 'SecurePass123',
    });
    expect(errors.phone).toBeUndefined();
  });
});

describe('validateProfile', () => {
  it('should return error for invalid email', () => {
    const errors = validateProfile({ email: 'invalid', phone: '' });
    expect(errors.email).toBe('Invalid email format');
  });

  it('should return error for invalid phone', () => {
    const errors = validateProfile({ email: 'test@example.com', phone: '123' });
    expect(errors.phone).toBe('Invalid phone format (e.g., +989123456789)');
  });

  it('should return empty object for valid profile data', () => {
    const errors = validateProfile({
      email: 'test@example.com',
      phone: '+989123456789',
    });
    expect(errors).toEqual({});
  });

  it('should allow empty phone', () => {
    const errors = validateProfile({ email: 'test@example.com', phone: '' });
    expect(errors).toEqual({});
  });
});

describe('validatePasswordChange', () => {
  it('should return error for missing current password', () => {
    const errors = validatePasswordChange({
      currentPassword: '',
      newPassword: 'SecurePass123',
      confirmPassword: 'SecurePass123',
    });
    expect(errors.currentPassword).toBe('Current password is required');
  });

  it('should return error for invalid new password', () => {
    const errors = validatePasswordChange({
      currentPassword: 'OldPass123',
      newPassword: 'abc123',
      confirmPassword: 'abc123',
    });
    expect(errors.newPassword).toBe('Must contain an uppercase letter');
  });

  it('should return error when passwords do not match', () => {
    const errors = validatePasswordChange({
      currentPassword: 'OldPass123',
      newPassword: 'SecurePass123',
      confirmPassword: 'WrongPass123',
    });
    expect(errors.confirmPassword).toBe('Passwords do not match');
  });

  it('should return empty object for valid password change', () => {
    const errors = validatePasswordChange({
      currentPassword: 'OldPass123',
      newPassword: 'SecurePass123',
      confirmPassword: 'SecurePass123',
    });
    expect(errors).toEqual({});
  });
});