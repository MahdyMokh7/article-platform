/**
 * Navbar Component Tests
 *
 * Tests for navigation bar rendering, auth-aware links, and mobile menu
 *
 * @module components/__tests__/Navbar.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Navbar from '../Navbar';
import { AuthProvider } from '../../context/AuthContext';
import * as authApi from '../../services/authApi';

// ============================
// Mocks
// ============================
vi.mock('../../services/authApi', () => ({
  login: vi.fn(),
  getCurrentUser: vi.fn(),
}));

// ============================
// Test wrapper
// ============================
const renderWithAuth = (ui) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {ui}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Navbar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Rendering', () => {
    it('should render logo/brand name', () => {
      renderWithAuth(<Navbar />);
      expect(screen.getByText('Article')).toBeInTheDocument();
      expect(screen.getByText('Platform')).toBeInTheDocument();
    });

    it('should render logo icon', () => {
      renderWithAuth(<Navbar />);
      expect(screen.getByText('📄')).toBeInTheDocument();
    });

    it('should render Home link', () => {
      renderWithAuth(<Navbar />);
      const homeLinks = screen.getAllByText('Home');
      expect(homeLinks.length).toBeGreaterThan(0);
    });

    it('should render Popular link', () => {
      renderWithAuth(<Navbar />);
      const popularLinks = screen.getAllByText('Popular');
      expect(popularLinks.length).toBeGreaterThan(0);
    });

    it('should have correct href for Home link', () => {
      renderWithAuth(<Navbar />);
      const homeLinks = screen.getAllByText('Home');
      expect(homeLinks[0].closest('a')).toHaveAttribute('href', '/');
    });

    it('should have correct href for Popular link', () => {
      renderWithAuth(<Navbar />);
      const popularLinks = screen.getAllByText('Popular');
      expect(popularLinks[0].closest('a')).toHaveAttribute('href', '/popular');
    });

    it('should have skip to content link', () => {
      renderWithAuth(<Navbar />);
      const skipLink = screen.getByText(/Skip to main content/i);
      expect(skipLink).toBeInTheDocument();
    });

    it('should render mobile menu button', () => {
      renderWithAuth(<Navbar />);
      const menuButton = screen.getByLabelText(/Open menu/i);
      expect(menuButton).toBeInTheDocument();
    });
  });

  describe('Authentication-aware rendering', () => {
    it('should show Login and Sign Up links when not authenticated', async () => {
      renderWithAuth(<Navbar />);

      await waitFor(() => {
        expect(screen.getAllByText(/login/i).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/sign up/i).length).toBeGreaterThan(0);
      });
    });

    it('should NOT show Write link when not authenticated', async () => {
      renderWithAuth(<Navbar />);

      await waitFor(() => {
        expect(screen.queryByText('Write')).not.toBeInTheDocument();
      });
    });

    it('should show User avatar and dropdown when authenticated', async () => {
      const mockUser = { id: 1, username: 'testuser', email: 'test@example.com' };
      localStorage.setItem('authToken', 'mock-token');
      localStorage.setItem('authUser', JSON.stringify(mockUser));
      authApi.getCurrentUser.mockResolvedValue(mockUser);

      renderWithAuth(<Navbar />);

      await waitFor(() => {
        expect(screen.getByText('testuser')).toBeInTheDocument();
        expect(screen.getByText('T')).toBeInTheDocument();
      });
    });

    it('should show Write link when authenticated', async () => {
      const mockUser = { id: 1, username: 'testuser', email: 'test@example.com' };
      localStorage.setItem('authToken', 'mock-token');
      localStorage.setItem('authUser', JSON.stringify(mockUser));
      authApi.getCurrentUser.mockResolvedValue(mockUser);

      renderWithAuth(<Navbar />);

      await waitFor(() => {
        // Use getAllByText and check length
        const writeElements = screen.getAllByText('Write');
        expect(writeElements.length).toBeGreaterThan(0);
      });
    });
  });

  describe('User dropdown menu', () => {
    it('should open dropdown when user avatar is clicked', async () => {
      const mockUser = { id: 1, username: 'testuser', email: 'test@example.com' };
      localStorage.setItem('authToken', 'mock-token');
      localStorage.setItem('authUser', JSON.stringify(mockUser));
      authApi.getCurrentUser.mockResolvedValue(mockUser);

      renderWithAuth(<Navbar />);

      await waitFor(() => {
        expect(screen.getByText('testuser')).toBeInTheDocument();
      });

      const userButton = screen.getByRole('button', { name: /user menu/i });
      await userEvent.click(userButton);

      const profileElements = screen.getAllByText(/profile/i);
      expect(profileElements.length).toBeGreaterThan(0);
    });

    it('should close dropdown when clicking outside', async () => {
      const mockUser = { id: 1, username: 'testuser', email: 'test@example.com' };
      localStorage.setItem('authToken', 'mock-token');
      localStorage.setItem('authUser', JSON.stringify(mockUser));
      authApi.getCurrentUser.mockResolvedValue(mockUser);

      renderWithAuth(<Navbar />);

      await waitFor(() => {
        expect(screen.getByText('testuser')).toBeInTheDocument();
      });

      const userButton = screen.getByRole('button', { name: /user menu/i });
      await userEvent.click(userButton);

      const profileElements = screen.getAllByText(/profile/i);
      expect(profileElements.length).toBeGreaterThan(0);

      // Click outside
      await userEvent.click(document.body);

      await waitFor(() => {
        const dropdownMenu = document.querySelector('[role="menu"]');
        expect(dropdownMenu).not.toBeInTheDocument();
      });
    });
  });

  describe('Mobile menu', () => {
    it('should open mobile menu when hamburger is clicked', async () => {
      Object.defineProperty(window, 'innerWidth', { value: 500, writable: true });
      window.dispatchEvent(new Event('resize'));

      renderWithAuth(<Navbar />);

      const menuButton = screen.getByLabelText(/Open menu/i);
      await userEvent.click(menuButton);

      const mobileMenu = screen.getByRole('dialog', { name: /mobile navigation menu/i });
      expect(mobileMenu).toBeInTheDocument();
    });
  });

  describe('Logout', () => {
    it('should call logout and redirect to home when Sign Out is clicked', async () => {
      const mockUser = { id: 1, username: 'testuser', email: 'test@example.com' };
      localStorage.setItem('authToken', 'mock-token');
      localStorage.setItem('authUser', JSON.stringify(mockUser));
      authApi.getCurrentUser.mockResolvedValue(mockUser);

      renderWithAuth(<Navbar />);

      await waitFor(() => {
        expect(screen.getByText('testuser')).toBeInTheDocument();
      });

      const userButton = screen.getByRole('button', { name: /user menu/i });
      await userEvent.click(userButton);

      // Use getAllByText and click the first one (desktop)
      const logoutButtons = screen.getAllByText(/sign out/i);
      expect(logoutButtons.length).toBeGreaterThan(0);
      
      // Click the first logout button (desktop)
      await userEvent.click(logoutButtons[0]);

      expect(localStorage.getItem('authToken')).toBeNull();
      expect(localStorage.getItem('authUser')).toBeNull();
    });
  });
});