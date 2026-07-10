/**
 * Auth API Service Tests
 *
 * Tests for authentication API functions (login, register, profile, password)
 *
 * @module services/__tests__/authApi.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ========== IMPORTANT: Mock axios FIRST ==========
vi.mock('../axiosConfig', () => {
  const mockApi = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn(), eject: vi.fn() },
      response: { use: vi.fn(), eject: vi.fn() },
    },
  };

  return {
    default: mockApi,
  };
});

import api from '../axiosConfig';
import {
  register,
  login,
  getCurrentUser,
  updateProfile,
  changePassword,
  logout,
} from '../authApi';

describe('Auth API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('register', () => {
    const userData = {
      username: 'john_doe',
      password: 'SecurePass123',
      email: 'john@example.com',
      phone: '+989123456789',
    };

    it('should register a new user successfully', async () => {
      const mockResponse = {
        id: 1,
        username: 'john_doe',
        email: 'john@example.com',
        phone: '+989123456789',
      };

      api.post.mockResolvedValue({ data: mockResponse });

      const result = await register(userData);

      expect(api.post).toHaveBeenCalledWith('/auth/register', userData);
      expect(result).toEqual(mockResponse);
    });

    it('should handle registration errors', async () => {
      const error = new Error('Username already exists');
      api.post.mockRejectedValue(error);

      await expect(register(userData)).rejects.toThrow('Username already exists');
    });
  });

  describe('login', () => {
    const credentials = {
      username: 'john_doe',
      password: 'SecurePass123',
    };

    it('should login successfully and return token', async () => {
      const mockResponse = {
        accessToken: 'jwt-token-123',
        tokenType: 'Bearer',
        userId: 1,
        username: 'john_doe',
        email: 'john@example.com',
      };

      api.post.mockResolvedValue({ data: mockResponse });

      const result = await login(credentials);

      expect(api.post).toHaveBeenCalledWith('/auth/login', credentials);
      expect(result).toEqual(mockResponse);
      expect(result.accessToken).toBe('jwt-token-123');
    });

    it('should handle login errors', async () => {
      const error = new Error('Invalid username or password');
      api.post.mockRejectedValue(error);

      await expect(login(credentials)).rejects.toThrow('Invalid username or password');
    });
  });

  describe('getCurrentUser', () => {
    it('should fetch current user profile', async () => {
      const mockUser = {
        id: 1,
        username: 'john_doe',
        email: 'john@example.com',
        phone: '+989123456789',
        articles: [],
      };

      api.get.mockResolvedValue({ data: mockUser });

      const result = await getCurrentUser();

      expect(api.get).toHaveBeenCalledWith('/users/profile');
      expect(result).toEqual(mockUser);
    });

    it('should handle unauthorized error', async () => {
      const error = new Error('Unauthorized');
      error.response = { status: 401 };
      api.get.mockRejectedValue(error);

      await expect(getCurrentUser()).rejects.toThrow('Unauthorized');
    });
  });

  describe('updateProfile', () => {
    const profileData = {
      email: 'newemail@example.com',
      phone: '+989987654321',
    };

    it('should update user profile successfully', async () => {
      const mockResponse = {
        id: 1,
        username: 'john_doe',
        email: 'newemail@example.com',
        phone: '+989987654321',
      };

      api.put.mockResolvedValue({ data: mockResponse });

      const result = await updateProfile(profileData);

      expect(api.put).toHaveBeenCalledWith('/users/profile', profileData);
      expect(result).toEqual(mockResponse);
    });

    it('should handle update errors', async () => {
      const error = new Error('Email already exists');
      api.put.mockRejectedValue(error);

      await expect(updateProfile(profileData)).rejects.toThrow('Email already exists');
    });
  });

  describe('changePassword', () => {
    const passwordData = {
      currentPassword: 'OldPass123',
      newPassword: 'NewSecurePass456',
    };

    it('should change password successfully', async () => {
    api.put.mockResolvedValue({ data: null, status: 204 });

    const result = await changePassword(passwordData);

    expect(api.put).toHaveBeenCalledWith('/users/password', passwordData);
    expect(result).toBeNull(); 
    });

    it('should handle incorrect current password', async () => {
      const error = new Error('Current password is incorrect');
      error.response = { status: 401 };
      api.put.mockRejectedValue(error);

      await expect(changePassword(passwordData)).rejects.toThrow('Current password is incorrect');
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      api.post.mockResolvedValue({ data: null, status: 204 });

      await logout();

      expect(api.post).toHaveBeenCalledWith('/auth/logout');
    });

    it('should handle logout errors gracefully', async () => {
      const error = new Error('Network error');
      api.post.mockRejectedValue(error);

      // Should not throw, just swallow the error
      await expect(logout()).resolves.toBeUndefined();
      expect(api.post).toHaveBeenCalledWith('/auth/logout');
    });
  });
});