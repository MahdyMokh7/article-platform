/**
 * AuthContext Unit Tests
 *
 * Tests for authentication context provider and hooks
 *
 * @module context/__tests__/AuthContext.test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../AuthContext';
import * as authApi from '../../services/authApi';

// ============================
// Mock authApi
// ============================
vi.mock('../../services/authApi', () => ({
  login: vi.fn(),
  register: vi.fn(),
  getCurrentUser: vi.fn(),
  updateProfile: vi.fn(),
  changePassword: vi.fn(),
  logout: vi.fn(),
}));

// ============================
// Mock localStorage
// ============================
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// ============================
// Test Helper Component
// ============================
const TestComponent = ({ onError }) => {
  const {
    user,
    token,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
  } = useAuth();

  const handleLogin = async () => {
    try {
      await login({ username: 'test', password: 'pass' });
    } catch (error) {
      if (onError) onError(error);
    }
  };

  const handleRegister = async () => {
    try {
      await register({ username: 'newuser', password: 'pass' });
    } catch (error) {
      if (onError) onError(error);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      await updateProfile({ email: 'new@example.com' });
    } catch (error) {
      if (onError) onError(error);
    }
  };

  const handleChangePassword = async () => {
    try {
      await changePassword({ currentPassword: 'old', newPassword: 'new' });
    } catch (error) {
      if (onError) onError(error);
    }
  };

  return (
    <div>
      <div data-testid="loading">{loading.toString()}</div>
      <div data-testid="isAuthenticated">{isAuthenticated.toString()}</div>
      <div data-testid="user">{user ? JSON.stringify(user) : 'null'}</div>
      <div data-testid="token">{token || 'null'}</div>

      <button data-testid="login-btn" onClick={handleLogin}>
        Login
      </button>
      <button data-testid="register-btn" onClick={handleRegister}>
        Register
      </button>
      <button data-testid="logout-btn" onClick={logout}>
        Logout
      </button>
      <button data-testid="update-profile-btn" onClick={handleUpdateProfile}>
        Update Profile
      </button>
      <button data-testid="change-password-btn" onClick={handleChangePassword}>
        Change Password
      </button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReset();
    localStorageMock.setItem.mockReset();
    localStorageMock.removeItem.mockReset();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('AuthProvider', () => {
    it('should provide authentication context to children', () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('loading')).toBeInTheDocument();
      expect(screen.getByTestId('isAuthenticated')).toBeInTheDocument();
    });

    it('should initialize with no user when no token exists', async () => {
      localStorageMock.getItem.mockReturnValue(null);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
      expect(screen.getByTestId('user')).toHaveTextContent('null');
      expect(screen.getByTestId('token')).toHaveTextContent('null');
    });

    it('should initialize with user when token exists', async () => {
      const mockUser = { id: 1, username: 'testuser', email: 'test@example.com' };
      localStorageMock.getItem
        .mockReturnValueOnce('mock-token')
        .mockReturnValueOnce(JSON.stringify(mockUser));

      authApi.getCurrentUser.mockResolvedValue(mockUser);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(mockUser));
      expect(screen.getByTestId('token')).toHaveTextContent('mock-token');
    });

    it('should logout when token is invalid', async () => {
      const mockUser = { id: 1, username: 'testuser' };
      localStorageMock.getItem
        .mockReturnValueOnce('invalid-token')
        .mockReturnValueOnce(JSON.stringify(mockUser));

      authApi.getCurrentUser.mockRejectedValue(new Error('Invalid token'));

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
      expect(screen.getByTestId('user')).toHaveTextContent('null');
      expect(screen.getByTestId('token')).toHaveTextContent('null');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('authToken');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('authUser');
    });
  });

  describe('login', () => {
    it('should login successfully and update state', async () => {
      const mockResponse = {
        accessToken: 'jwt-token-123',
        userId: 1,
        username: 'testuser',
        email: 'test@example.com',
      };

      authApi.login.mockResolvedValue(mockResponse);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      const loginBtn = screen.getByTestId('login-btn');
      await userEvent.click(loginBtn);

      await waitFor(() => {
        expect(authApi.login).toHaveBeenCalledWith({
          username: 'test',
          password: 'pass',
        });
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'authToken',
          'jwt-token-123'
        );
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'authUser',
          JSON.stringify(mockResponse)
        );
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
        expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(mockResponse));
        expect(screen.getByTestId('token')).toHaveTextContent('jwt-token-123');
      });
    });

    it('should handle login failure - state remains false', async () => {
      const error = new Error('Invalid credentials');
      const errorHandler = vi.fn();

      authApi.login.mockRejectedValue(error);

      render(
        <AuthProvider>
          <TestComponent onError={errorHandler} />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      const loginBtn = screen.getByTestId('login-btn');
      await userEvent.click(loginBtn);

      await waitFor(() => {
        expect(errorHandler).toHaveBeenCalledWith(error);
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
        expect(screen.getByTestId('user')).toHaveTextContent('null');
        expect(screen.getByTestId('token')).toHaveTextContent('null');
      });
    });
  });

  describe('register', () => {
    it('should register successfully', async () => {
      const mockUser = { id: 1, username: 'newuser', email: 'new@example.com' };
      authApi.register.mockResolvedValue(mockUser);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      const registerBtn = screen.getByTestId('register-btn');
      await userEvent.click(registerBtn);

      await waitFor(() => {
        expect(authApi.register).toHaveBeenCalledWith({
          username: 'newuser',
          password: 'pass',
        });
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
      });
    });

    it('should handle registration failure - state remains false', async () => {
      const error = new Error('Username already exists');
      const errorHandler = vi.fn();

      authApi.register.mockRejectedValue(error);

      render(
        <AuthProvider>
          <TestComponent onError={errorHandler} />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      const registerBtn = screen.getByTestId('register-btn');
      await userEvent.click(registerBtn);

      await waitFor(() => {
        expect(errorHandler).toHaveBeenCalledWith(error);
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
        expect(screen.getByTestId('user')).toHaveTextContent('null');
      });
    });
  });

  describe('logout', () => {
    it('should logout and clear state', async () => {
      const mockUser = { id: 1, username: 'testuser' };
      localStorageMock.getItem
        .mockReturnValueOnce('mock-token')
        .mockReturnValueOnce(JSON.stringify(mockUser));

      authApi.getCurrentUser.mockResolvedValue(mockUser);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
      });

      const logoutBtn = screen.getByTestId('logout-btn');
      await userEvent.click(logoutBtn);

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('authToken');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('authUser');
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
      expect(screen.getByTestId('user')).toHaveTextContent('null');
      expect(screen.getByTestId('token')).toHaveTextContent('null');
    });
  });

  describe('updateProfile', () => {
    it('should update profile successfully', async () => {
      const mockUser = { id: 1, username: 'testuser', email: 'test@example.com' };
      const updatedUser = { ...mockUser, email: 'new@example.com' };

      localStorageMock.getItem
        .mockReturnValueOnce('mock-token')
        .mockReturnValueOnce(JSON.stringify(mockUser));

      authApi.getCurrentUser.mockResolvedValue(mockUser);
      authApi.updateProfile.mockResolvedValue(updatedUser);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      // Clear setItem calls from initialization
      localStorageMock.setItem.mockClear();

      const updateBtn = screen.getByTestId('update-profile-btn');
      await userEvent.click(updateBtn);

      await waitFor(() => {
        expect(authApi.updateProfile).toHaveBeenCalledWith({
          email: 'new@example.com',
        });
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'authUser',
          JSON.stringify(updatedUser)
        );
        expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(updatedUser));
      });
    });

    it('should handle profile update failure - state unchanged', async () => {
      const error = new Error('Email already exists');
      const errorHandler = vi.fn();
      const mockUser = { id: 1, username: 'testuser' };

      localStorageMock.getItem
        .mockReturnValueOnce('mock-token')
        .mockReturnValueOnce(JSON.stringify(mockUser));

      authApi.getCurrentUser.mockResolvedValue(mockUser);
      authApi.updateProfile.mockRejectedValue(error);

      // Clear setItem calls from initialization
      localStorageMock.setItem.mockClear();

      render(
        <AuthProvider>
          <TestComponent onError={errorHandler} />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
        expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(mockUser));
      });

      // Clear again after render (to remove any remaining initialization calls)
      localStorageMock.setItem.mockClear();

      const updateBtn = screen.getByTestId('update-profile-btn');
      await userEvent.click(updateBtn);

      await waitFor(() => {
        expect(errorHandler).toHaveBeenCalledWith(error);
        expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(mockUser));
      });

      // Verify setItem was not called after the update attempt
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const mockUser = { id: 1, username: 'testuser' };

      localStorageMock.getItem
        .mockReturnValueOnce('mock-token')
        .mockReturnValueOnce(JSON.stringify(mockUser));

      authApi.getCurrentUser.mockResolvedValue(mockUser);
      authApi.changePassword.mockResolvedValue({ success: true });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      const changePwdBtn = screen.getByTestId('change-password-btn');
      await userEvent.click(changePwdBtn);

      await waitFor(() => {
        expect(authApi.changePassword).toHaveBeenCalledWith({
          currentPassword: 'old',
          newPassword: 'new',
        });
      });
    });

    it('should handle password change failure - state unchanged', async () => {
      const error = new Error('Current password is incorrect');
      const errorHandler = vi.fn();
      const mockUser = { id: 1, username: 'testuser' };

      localStorageMock.getItem
        .mockReturnValueOnce('mock-token')
        .mockReturnValueOnce(JSON.stringify(mockUser));

      authApi.getCurrentUser.mockResolvedValue(mockUser);
      authApi.changePassword.mockRejectedValue(error);

      render(
        <AuthProvider>
          <TestComponent onError={errorHandler} />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
        expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(mockUser));
      });

      // Clear setItem calls from initialization
      localStorageMock.setItem.mockClear();

      const changePwdBtn = screen.getByTestId('change-password-btn');
      await userEvent.click(changePwdBtn);

      await waitFor(() => {
        expect(errorHandler).toHaveBeenCalledWith(error);
        expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify(mockUser));
      });

      // Verify setItem was not called after the update attempt
      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });
  });

  describe('useAuth hook', () => {
    it('should throw error when used outside AuthProvider', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => render(<TestComponent />)).toThrow(
        'useAuth must be used within an AuthProvider'
      );

      consoleSpy.mockRestore();
    });
  });
});