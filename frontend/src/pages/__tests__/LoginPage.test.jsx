/**
 * LoginPage Component Tests
 *
 * Tests for login form rendering, validation, and submission
 *
 * @module pages/__tests__/LoginPage.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../LoginPage';
import { AuthProvider } from '../../context/AuthContext';
import * as authApi from '../../services/authApi';

// ============================
// Mocks
// ============================
vi.mock('../../services/authApi', () => ({
  login: vi.fn(),
}));

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// ============================
// Test Wrapper
// ============================
const renderWithProviders = (ui) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {ui}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render login form', () => {
      renderWithProviders(<LoginPage />);

      expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('should display link to register page', () => {
      renderWithProviders(<LoginPage />);

      const registerLink = screen.getByRole('link', { name: /sign up/i });
      expect(registerLink).toBeInTheDocument();
      expect(registerLink).toHaveAttribute('href', '/register');
    });
  });

  describe('Form Validation', () => {
    it('should show validation errors when submitting empty form', async () => {
      renderWithProviders(<LoginPage />);

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/username is required/i)).toBeInTheDocument();
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });
    });

    it('should show username error on blur', async () => {
      renderWithProviders(<LoginPage />);

      const usernameInput = screen.getByLabelText(/username/i);
      await userEvent.click(usernameInput);
      await userEvent.tab(); // Blur the input

      await waitFor(() => {
        expect(screen.getByText(/username is required/i)).toBeInTheDocument();
      });
    });

    it('should show password error on blur', async () => {
      renderWithProviders(<LoginPage />);

      const passwordInput = screen.getByLabelText(/password/i);
      await userEvent.click(passwordInput);
      await userEvent.tab(); // Blur the input

      await waitFor(() => {
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('should login successfully and redirect', async () => {
      const mockResponse = {
        accessToken: 'jwt-token',
        userId: 1,
        username: 'testuser',
        email: 'test@example.com',
      };

      authApi.login.mockResolvedValue({ data: mockResponse });

      renderWithProviders(<LoginPage />);

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await userEvent.type(usernameInput, 'testuser');
      await userEvent.type(passwordInput, 'SecurePass123');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(authApi.login).toHaveBeenCalledWith({
          username: 'testuser',
          password: 'SecurePass123',
        });
      });
    });

    it('should show error on login failure', async () => {
    const error = new Error('Invalid credentials');
    error.response = { data: { message: 'Invalid username or password' } };
    authApi.login.mockRejectedValue(error);

    renderWithProviders(<LoginPage />);

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    // Use a valid password that meets validation requirements
    await userEvent.type(usernameInput, 'wronguser');
    await userEvent.type(passwordInput, 'WrongPass123'); // ← Changed from 'wrongpass' to valid password
    await userEvent.click(submitButton);

    await waitFor(() => {
        expect(screen.getByText(/invalid username or password/i)).toBeInTheDocument();
    });
    });

    it('should show generic error when no message provided', async () => {
      const error = new Error('Network error');
      authApi.login.mockRejectedValue(error);

      renderWithProviders(<LoginPage />);

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await userEvent.type(usernameInput, 'testuser');
      await userEvent.type(passwordInput, 'SecurePass123');
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid username or password/i)).toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    it('should disable form inputs during submission', async () => {
      authApi.login.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      renderWithProviders(<LoginPage />);

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await userEvent.type(usernameInput, 'testuser');
      await userEvent.type(passwordInput, 'SecurePass123');
      await userEvent.click(submitButton);

      expect(usernameInput).toBeDisabled();
      expect(passwordInput).toBeDisabled();
      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveTextContent(/signing in/i);
    });
  });
});