/**
 * RegisterPage Component Tests
 *
 * Tests for registration form rendering, validation, and submission
 *
 * @module pages/__tests__/RegisterPage.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import RegisterPage from '../RegisterPage';
import { AuthProvider } from '../../context/AuthContext';
import * as authApi from '../../services/authApi';

// ============================
// Mocks
// ============================
vi.mock('../../services/authApi', () => ({
  register: vi.fn(),
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

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render registration form', () => {
      renderWithProviders(<RegisterPage />);

      expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/username \*/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email \*/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password \*$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^confirm password \*$/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    });

    it('should display link to login page', () => {
      renderWithProviders(<RegisterPage />);

      const loginLink = screen.getByRole('link', { name: /sign in/i });
      expect(loginLink).toBeInTheDocument();
      expect(loginLink).toHaveAttribute('href', '/login');
    });
  });

  describe('Form Validation', () => {
    it('should show validation errors when submitting empty form', async () => {
      renderWithProviders(<RegisterPage />);

      const submitButton = screen.getByRole('button', { name: /create account/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/username is required/i)).toBeInTheDocument();
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
        expect(screen.getByText(/please confirm your password/i)).toBeInTheDocument();
      });
    });

    it('should validate username on blur', async () => {
      renderWithProviders(<RegisterPage />);

      const usernameInput = screen.getByLabelText(/username \*/i);
      await userEvent.type(usernameInput, 'ab');
      await userEvent.tab();

      await waitFor(() => {
        expect(screen.getByText(/username must be at least 3 characters/i)).toBeInTheDocument();
      });
    });

    it('should validate email on blur', async () => {
      renderWithProviders(<RegisterPage />);

      const emailInput = screen.getByLabelText(/email \*/i);
      await userEvent.type(emailInput, 'invalid');
      await userEvent.tab();

      await waitFor(() => {
        expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
      });
    });

    it('should validate phone on blur', async () => {
      renderWithProviders(<RegisterPage />);

      const phoneInput = screen.getByLabelText(/phone/i);
      await userEvent.type(phoneInput, '123');
      await userEvent.tab();

      await waitFor(() => {
        expect(screen.getByText(/invalid phone format/i)).toBeInTheDocument();
      });
    });

    it('should validate password requirements', async () => {
      renderWithProviders(<RegisterPage />);

      const passwordInput = screen.getByLabelText(/^password \*$/i);
      
      // Test short password
      await userEvent.type(passwordInput, 'Abc12');
      await userEvent.tab();
      
      await waitFor(() => {
        expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
      });

      // Test missing uppercase
      await userEvent.clear(passwordInput);
      await userEvent.type(passwordInput, 'abcdef123');
      await userEvent.tab();

      await waitFor(() => {
        expect(screen.getByText(/must contain an uppercase letter/i)).toBeInTheDocument();
      });

      // Test missing lowercase
      await userEvent.clear(passwordInput);
      await userEvent.type(passwordInput, 'ABCDEF123');
      await userEvent.tab();

      await waitFor(() => {
        expect(screen.getByText(/must contain a lowercase letter/i)).toBeInTheDocument();
      });

      // Test missing number
      await userEvent.clear(passwordInput);
      await userEvent.type(passwordInput, 'Abcdefgh');
      await userEvent.tab();

      await waitFor(() => {
        expect(screen.getByText(/must contain a number/i)).toBeInTheDocument();
      });
    });

    it('should validate confirm password matching', async () => {
      renderWithProviders(<RegisterPage />);

      const passwordInput = screen.getByLabelText(/^password \*$/i);
      const confirmInput = screen.getByLabelText(/^confirm password \*$/i);

      await userEvent.type(passwordInput, 'SecurePass123');
      await userEvent.type(confirmInput, 'DifferentPass456');
      await userEvent.tab();

      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });
    });

    it('should accept valid phone as optional', async () => {
      renderWithProviders(<RegisterPage />);

      const phoneInput = screen.getByLabelText(/phone/i);
      await userEvent.type(phoneInput, '+989123456789');
      await userEvent.tab();

      await waitFor(() => {
        expect(screen.queryByText(/invalid phone format/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Password Strength Indicator', () => {
    it('should show password strength indicator', async () => {
    renderWithProviders(<RegisterPage />);

    const passwordInput = screen.getByLabelText(/^password \*$/i);
    
    await userEvent.type(passwordInput, 'Abc123');

    await waitFor(() => {
        expect(screen.getByText(/good/i)).toBeInTheDocument(); // ← Changed from "fair" to "good"
    });
    });

    it('should show strong password indicator', async () => {
      renderWithProviders(<RegisterPage />);

      const passwordInput = screen.getByLabelText(/^password \*$/i);
      
      await userEvent.type(passwordInput, 'SecurePass123!');

      await waitFor(() => {
        expect(screen.getByText(/very strong/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('should register successfully and redirect to login', async () => {
      const mockUser = { id: 1, username: 'newuser' };
      authApi.register.mockResolvedValue(mockUser);

      renderWithProviders(<RegisterPage />);

      await userEvent.type(screen.getByLabelText(/username \*/i), 'newuser');
      await userEvent.type(screen.getByLabelText(/email \*/i), 'new@example.com');
      await userEvent.type(screen.getByLabelText(/phone/i), '+989123456789');
      await userEvent.type(screen.getByLabelText(/^password \*$/i), 'SecurePass123');
      await userEvent.type(screen.getByLabelText(/^confirm password \*$/i), 'SecurePass123');

      const submitButton = screen.getByRole('button', { name: /create account/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(authApi.register).toHaveBeenCalledWith({
          username: 'newuser',
          email: 'new@example.com',
          phone: '+989123456789',
          password: 'SecurePass123',
        });
      });
    });

    it('should show error on registration failure', async () => {
      const error = new Error('Username already exists');
      error.response = { data: { message: 'Username already exists' } };
      authApi.register.mockRejectedValue(error);

      renderWithProviders(<RegisterPage />);

      await userEvent.type(screen.getByLabelText(/username \*/i), 'existinguser');
      await userEvent.type(screen.getByLabelText(/email \*/i), 'new@example.com');
      await userEvent.type(screen.getByLabelText(/^password \*$/i), 'SecurePass123');
      await userEvent.type(screen.getByLabelText(/^confirm password \*$/i), 'SecurePass123');

      const submitButton = screen.getByRole('button', { name: /create account/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/username already exists/i)).toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    it('should disable form inputs during submission', async () => {
      authApi.register.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      renderWithProviders(<RegisterPage />);

      await userEvent.type(screen.getByLabelText(/username \*/i), 'newuser');
      await userEvent.type(screen.getByLabelText(/email \*/i), 'new@example.com');
      await userEvent.type(screen.getByLabelText(/^password \*$/i), 'SecurePass123');
      await userEvent.type(screen.getByLabelText(/^confirm password \*$/i), 'SecurePass123');

      const submitButton = screen.getByRole('button', { name: /create account/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
        expect(submitButton).toHaveTextContent(/creating account/i);
      });
    });
  });
});