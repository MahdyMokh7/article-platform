/**
 * ArticlePage Component Tests
 *
 * Tests for article display, loading states, error handling, and auth-aware actions
 *
 * @module pages/__tests__/ArticlePage.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import ArticlePage from '../ArticlePage';
import { AuthProvider } from '../../context/AuthContext';
import * as articleApi from '../../services/articleApi';
import * as authApi from '../../services/authApi';

// ============================
// Mocks
// ============================
vi.mock('../../services/articleApi', () => ({
  getArticleById: vi.fn(),
  deleteArticle: vi.fn(),
}));

vi.mock('../../services/authApi', () => ({
  getCurrentUser: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: '1' }),
    useNavigate: () => mockNavigate,
  };
});

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
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

describe('ArticlePage', () => {
  const mockArticle = {
    id: 1,
    title: 'Test Article',
    abstractText: 'This is a test abstract',
    body: 'This is the full body content of the test article.',
    publicationDate: '2024-01-15T10:00:00Z',
    citationCount: 5,
    references: [
      { id: 2, title: 'Reference Article 1', citationCount: 2 },
      { id: 3, title: 'Reference Article 2', citationCount: 0 },
    ],
    authorId: 1,
    author: { id: 1, username: 'testuser' },
  };

  const mockUser = { id: 1, username: 'testuser', email: 'test@example.com' };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Loading state', () => {
    it('should show loading skeleton while fetching article', () => {
      articleApi.getArticleById.mockImplementation(() => new Promise(() => {}));

      renderWithAuth(<ArticlePage />);

      // The skeleton has no text, so check for the container element
      const skeleton = document.querySelector('[class*="skeleton"]');
      expect(skeleton).toBeInTheDocument();
    });
  });

  describe('Article display', () => {
    it('should display article content when loaded', async () => {
      articleApi.getArticleById.mockResolvedValue(mockArticle);

      renderWithAuth(<ArticlePage />);

      await waitFor(() => {
        const titles = screen.getAllByText('Test Article');
        expect(titles.length).toBeGreaterThan(0);
        expect(screen.getByText('This is a test abstract')).toBeInTheDocument();
        expect(screen.getByText('This is the full body content of the test article.')).toBeInTheDocument();
      });
    });

    it('should display formatted date', async () => {
      articleApi.getArticleById.mockResolvedValue(mockArticle);

      renderWithAuth(<ArticlePage />);

      await waitFor(() => {
        expect(screen.getByText(/January 15, 2024/)).toBeInTheDocument();
      });
    });

    it('should display citation count', async () => {
      articleApi.getArticleById.mockResolvedValue(mockArticle);

      renderWithAuth(<ArticlePage />);

      await waitFor(() => {
        expect(screen.getByText('Cited by')).toBeInTheDocument();
        expect(screen.getByText('5')).toBeInTheDocument();
      });
    });

    it('should display references when present', async () => {
      articleApi.getArticleById.mockResolvedValue(mockArticle);

      renderWithAuth(<ArticlePage />);

      await waitFor(() => {
        expect(screen.getByText(/📚 References \(2\)/)).toBeInTheDocument();
        expect(screen.getByText('Reference Article 1')).toBeInTheDocument();
        expect(screen.getByText('Reference Article 2')).toBeInTheDocument();
      });
    });

    it('should not show references section when no references', async () => {
      const articleWithoutRefs = { ...mockArticle, references: [] };
      articleApi.getArticleById.mockResolvedValue(articleWithoutRefs);

      renderWithAuth(<ArticlePage />);

      await waitFor(() => {
        expect(screen.queryByText(/References/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Error handling', () => {
    it('should show "Article not found" for 404 errors', async () => {
      const error = new Error('Not found');
      error.response = { status: 404 };
      articleApi.getArticleById.mockRejectedValue(error);

      renderWithAuth(<ArticlePage />);

      await waitFor(() => {
        expect(screen.getByText('Article not found')).toBeInTheDocument();
      });
    });

    it('should show generic error for other errors', async () => {
      articleApi.getArticleById.mockRejectedValue(new Error('Network error'));

      renderWithAuth(<ArticlePage />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load article. Please try again.')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('should have breadcrumb navigation', async () => {
      articleApi.getArticleById.mockResolvedValue(mockArticle);

      renderWithAuth(<ArticlePage />);

      await waitFor(() => {
        expect(screen.getByText('Home')).toBeInTheDocument();
        const titles = screen.getAllByText('Test Article');
        expect(titles.length).toBeGreaterThan(0);
      });
    });

    it('should navigate back to home', async () => {
      articleApi.getArticleById.mockResolvedValue(mockArticle);

      renderWithAuth(<ArticlePage />);

      await waitFor(() => {
        const backLink = screen.getByText(/Back to all articles/);
        expect(backLink).toBeInTheDocument();
      });
    });
  });

  describe('Edit/Delete buttons', () => {
    it('should NOT show Edit/Delete buttons when user is not authenticated', async () => {
      articleApi.getArticleById.mockResolvedValue(mockArticle);

      renderWithAuth(<ArticlePage />);

      await waitFor(() => {
        expect(screen.queryByText('✏️ Edit Article')).not.toBeInTheDocument();
        expect(screen.queryByText('🗑️ Delete Article')).not.toBeInTheDocument();
      });
    });

    it('should show Edit/Delete buttons when user is authenticated and is author', async () => {
      localStorage.setItem('authToken', 'mock-token');
      localStorage.setItem('authUser', JSON.stringify(mockUser));
      authApi.getCurrentUser.mockResolvedValue(mockUser);

      articleApi.getArticleById.mockResolvedValue(mockArticle);

      renderWithAuth(<ArticlePage />);

      await waitFor(() => {
        expect(screen.getByText('✏️ Edit Article')).toBeInTheDocument();
        expect(screen.getByText('🗑️ Delete Article')).toBeInTheDocument();
      });
    });

    it('should navigate to edit page when Edit button is clicked', async () => {
      localStorage.setItem('authToken', 'mock-token');
      localStorage.setItem('authUser', JSON.stringify(mockUser));
      authApi.getCurrentUser.mockResolvedValue(mockUser);

      articleApi.getArticleById.mockResolvedValue(mockArticle);

      renderWithAuth(<ArticlePage />);

      await waitFor(() => {
        expect(screen.getByText('✏️ Edit Article')).toBeInTheDocument();
      });

      const editButton = screen.getByText('✏️ Edit Article');
      await userEvent.click(editButton);

      expect(mockNavigate).toHaveBeenCalledWith('/edit/1');
    });

    it('should call deleteArticle and navigate home when Delete is confirmed', async () => {
      localStorage.setItem('authToken', 'mock-token');
      localStorage.setItem('authUser', JSON.stringify(mockUser));
      authApi.getCurrentUser.mockResolvedValue(mockUser);

      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      articleApi.getArticleById.mockResolvedValue(mockArticle);
      articleApi.deleteArticle.mockResolvedValue();

      renderWithAuth(<ArticlePage />);

      await waitFor(() => {
        expect(screen.getByText('🗑️ Delete Article')).toBeInTheDocument();
      });

      const deleteButton = screen.getByText('🗑️ Delete Article');
      await userEvent.click(deleteButton);

      await waitFor(() => {
        expect(articleApi.deleteArticle).toHaveBeenCalledWith('1');
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });

      confirmSpy.mockRestore();
    });

    it('should NOT delete when confirmation is cancelled', async () => {
      localStorage.setItem('authToken', 'mock-token');
      localStorage.setItem('authUser', JSON.stringify(mockUser));
      authApi.getCurrentUser.mockResolvedValue(mockUser);

      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
      articleApi.getArticleById.mockResolvedValue(mockArticle);

      renderWithAuth(<ArticlePage />);

      await waitFor(() => {
        expect(screen.getByText('🗑️ Delete Article')).toBeInTheDocument();
      });

      const deleteButton = screen.getByText('🗑️ Delete Article');
      await userEvent.click(deleteButton);

      await waitFor(() => {
        expect(articleApi.deleteArticle).not.toHaveBeenCalled();
      });

      confirmSpy.mockRestore();
    });
  });
});