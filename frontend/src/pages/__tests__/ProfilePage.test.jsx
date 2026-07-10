/**
 * ProfilePage Component Tests
 *
 * Tests for profile display, editing, password change, and logout
 *
 * @module pages/__tests__/ProfilePage.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import ProfilePage from '../ProfilePage';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import * as authApi from '../../services/authApi';

// ============================
// Mocks
// ============================
vi.mock('../../services/authApi', () => ({
  login: vi.fn(),
  register: vi.fn(),
  getCurrentUser: vi.fn(),
  updateProfile: vi.fn(),
  changePassword: vi.fn(),
  logout: vi.fn(),
}));

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// ============================
// Mock user data
// ============================
const mockUser = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  phone: '+989123456789',
  createdAt: '2024-01-01T00:00:00Z',
  articles: [
    { id: 1, title: 'My First Article', publicationDate: '2024-01-01T00:00:00Z' },
    { id: 2, title: 'My Second Article', publicationDate: '2024-01-02T00:00:00Z' },
  ],
};

// ============================
// Test Wrapper with mock auth
// ============================
const TestWrapper = ({ children, user = mockUser }) => {
  return (
    <BrowserRouter>
      <AuthProvider>
        {children}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Rendering', () => {
    it('should display user information', async () => {
      localStorage.setItem('authUser', JSON.stringify(mockUser));
      localStorage.setItem('authToken', 'mock-token');
      authApi.getCurrentUser.mockResolvedValue(mockUser);

      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(mockUser.username)).toBeInTheDocument();
        expect(screen.getByText(mockUser.email)).toBeInTheDocument();
        expect(screen.getByText(mockUser.phone)).toBeInTheDocument();
      });
    });

    it('should display user articles', async () => {
      localStorage.setItem('authUser', JSON.stringify(mockUser));
      localStorage.setItem('authToken', 'mock-token');
      authApi.getCurrentUser.mockResolvedValue(mockUser);

      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('My First Article')).toBeInTheDocument();
        expect(screen.getByText('My Second Article')).toBeInTheDocument();
      });
    });

    it('should show empty state when no articles', async () => {
      const userWithoutArticles = { ...mockUser, articles: [] };
      localStorage.setItem('authUser', JSON.stringify(userWithoutArticles));
      localStorage.setItem('authToken', 'mock-token');
      authApi.getCurrentUser.mockResolvedValue(userWithoutArticles);

      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/you haven't published any articles yet/i)).toBeInTheDocument();
        expect(screen.getByText(/write your first article/i)).toBeInTheDocument();
      });
    });
  });

  describe('Profile Editing', () => {
    it('should toggle edit mode', async () => {
      localStorage.setItem('authUser', JSON.stringify(mockUser));
      localStorage.setItem('authToken', 'mock-token');
      authApi.getCurrentUser.mockResolvedValue(mockUser);

      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(mockUser.email)).toBeInTheDocument();
      });

      const editButton = screen.getByRole('button', { name: /edit profile/i });
      await userEvent.click(editButton);

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
    });

    it('should update profile successfully', async () => {
      const updatedUser = { ...mockUser, email: 'updated@example.com' };
      localStorage.setItem('authUser', JSON.stringify(mockUser));
      localStorage.setItem('authToken', 'mock-token');
      authApi.getCurrentUser.mockResolvedValue(mockUser);
      authApi.updateProfile.mockResolvedValue(updatedUser);

      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(mockUser.email)).toBeInTheDocument();
      });

      const editButton = screen.getByRole('button', { name: /edit profile/i });
      await userEvent.click(editButton);

      const emailInput = screen.getByLabelText(/email/i);
      await userEvent.clear(emailInput);
      await userEvent.type(emailInput, 'updated@example.com');

      // Ensure phone is properly set
      const phoneInput = screen.getByLabelText(/phone/i);
      await userEvent.clear(phoneInput);
      await userEvent.type(phoneInput, mockUser.phone);

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      await userEvent.click(saveButton);

      await waitFor(() => {
        expect(authApi.updateProfile).toHaveBeenCalledWith({
          email: 'updated@example.com',
          phone: mockUser.phone,
        });
      });
    });

    it('should show validation error for invalid email', async () => {
      localStorage.setItem('authUser', JSON.stringify(mockUser));
      localStorage.setItem('authToken', 'mock-token');
      authApi.getCurrentUser.mockResolvedValue(mockUser);

      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(mockUser.email)).toBeInTheDocument();
      });

      const editButton = screen.getByRole('button', { name: /edit profile/i });
      await userEvent.click(editButton);

      const emailInput = screen.getByLabelText(/email/i);
      await userEvent.clear(emailInput);
      await userEvent.type(emailInput, 'invalid-email');
      await userEvent.tab();

      await waitFor(() => {
        expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
      });
    });
  });

  describe('Password Change', () => {
    it('should toggle password change mode', async () => {
      localStorage.setItem('authUser', JSON.stringify(mockUser));
      localStorage.setItem('authToken', 'mock-token');
      authApi.getCurrentUser.mockResolvedValue(mockUser);

      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(mockUser.username)).toBeInTheDocument();
      });

      // Use role-based selector to target the button, not the heading
      const changePasswordButton = screen.getByRole('button', { name: /change password/i });
      await userEvent.click(changePasswordButton);

      expect(screen.getByLabelText(/current password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    });

    it('should change password successfully', async () => {
      localStorage.setItem('authUser', JSON.stringify(mockUser));
      localStorage.setItem('authToken', 'mock-token');
      authApi.getCurrentUser.mockResolvedValue(mockUser);
      authApi.changePassword.mockResolvedValue({ success: true });

      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(mockUser.username)).toBeInTheDocument();
      });

      const changePasswordButton = screen.getByRole('button', { name: /change password/i });
      await userEvent.click(changePasswordButton);

      await userEvent.type(screen.getByLabelText(/current password/i), 'OldPass123');
      await userEvent.type(screen.getByLabelText(/new password/i), 'NewSecurePass456');
      await userEvent.type(screen.getByLabelText(/confirm password/i), 'NewSecurePass456');

      const submitButton = screen.getByRole('button', { name: /change password/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(authApi.changePassword).toHaveBeenCalledWith({
          currentPassword: 'OldPass123',
          newPassword: 'NewSecurePass456',
        });
      });
    });

    it('should show error when passwords do not match', async () => {
      localStorage.setItem('authUser', JSON.stringify(mockUser));
      localStorage.setItem('authToken', 'mock-token');
      authApi.getCurrentUser.mockResolvedValue(mockUser);

      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(mockUser.username)).toBeInTheDocument();
      });

      const changePasswordButton = screen.getByRole('button', { name: /change password/i });
      await userEvent.click(changePasswordButton);

      await userEvent.type(screen.getByLabelText(/new password/i), 'SecurePass123');
      await userEvent.type(screen.getByLabelText(/confirm password/i), 'DifferentPass456');
      await userEvent.tab();

      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });
    });
  });

  describe('Logout', () => {
    it('should logout and redirect to home', async () => {
      localStorage.setItem('authUser', JSON.stringify(mockUser));
      localStorage.setItem('authToken', 'mock-token');
      authApi.getCurrentUser.mockResolvedValue(mockUser);

      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(mockUser.username)).toBeInTheDocument();
      });

      const logoutButton = screen.getByRole('button', { name: /sign out/i });
      await userEvent.click(logoutButton);

      expect(localStorage.getItem('authToken')).toBeNull();
      expect(localStorage.getItem('authUser')).toBeNull();
    });
  });

  describe('Protected Route Behavior', () => {
    it('should show loading when user not available', async () => {
      localStorage.removeItem('authUser');
      localStorage.removeItem('authToken');
      authApi.getCurrentUser.mockRejectedValue(new Error('Not authenticated'));

      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/loading/i)).toBeInTheDocument();
      });
    });
  });
});