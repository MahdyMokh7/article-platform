/**
 * ArticleCard Component Tests
 *
 * Tests for article card rendering, conditional actions, and accessibility
 *
 * @module components/__tests__/ArticleCard.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import ArticleCard from '../ArticleCard';
import { AuthProvider } from '../../context/AuthContext';
import * as authApi from '../../services/authApi';

// ============================
// Mocks
// ============================
vi.mock('../../services/authApi', () => ({
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

describe('ArticleCard Component', () => {
  const mockArticle = {
    id: 1,
    title: 'Test Article Title',
    abstractText: 'This is a test abstract for the article card component.',
    publicationDate: '2024-01-15T10:00:00Z',
    citationCount: 5,
    authorId: 1,
    author: { id: 1, username: 'testuser' },
  };

  const mockUser = { id: 1, username: 'testuser' };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Rendering', () => {
    it('should render article title', () => {
      renderWithAuth(<ArticleCard article={mockArticle} />);
      expect(screen.getByText('Test Article Title')).toBeInTheDocument();
    });

    it('should render formatted date', () => {
      renderWithAuth(<ArticleCard article={mockArticle} />);
      expect(screen.getByText(/January 15, 2024/)).toBeInTheDocument();
    });

    it('should render abstract text', () => {
      renderWithAuth(<ArticleCard article={mockArticle} />);
      expect(screen.getByText(/test abstract/i)).toBeInTheDocument();
    });

    it('should render citation count as a number in badge', () => {
      renderWithAuth(<ArticleCard article={mockArticle} />);
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should have tooltip with citation text', () => {
      renderWithAuth(<ArticleCard article={mockArticle} />);
      const badge = screen.getByTitle('Cited 5 times');
      expect(badge).toBeInTheDocument();
    });

    it('should render read more link', () => {
      renderWithAuth(<ArticleCard article={mockArticle} />);
      const readMoreLink = screen.getByText(/Read full article/);
      expect(readMoreLink.closest('a')).toHaveAttribute('href', '/article/1');
    });

    it('should handle article without abstract', () => {
      const articleWithoutAbstract = {
        ...mockArticle,
        abstractText: null,
      };
      renderWithAuth(<ArticleCard article={articleWithoutAbstract} />);
      expect(screen.queryByText(/test abstract/i)).not.toBeInTheDocument();
    });

    it('should NOT show citation badge when citation count is zero', () => {
      const articleNoCitations = {
        ...mockArticle,
        citationCount: 0,
      };
      renderWithAuth(<ArticleCard article={articleNoCitations} />);
      expect(screen.queryByText('0')).not.toBeInTheDocument();
    });

    it('should return null if article is missing', () => {
      const { container } = renderWithAuth(<ArticleCard article={null} />);
      expect(container.firstChild).toBeNull();
    });

    it('should apply compact class when compact prop is true', () => {
      const { container } = renderWithAuth(<ArticleCard article={mockArticle} compact={true} />);
      expect(container.firstChild).toHaveClass(/compact/);
    });
  });

  describe('Conditional Edit/Delete Buttons', () => {
    it('should NOT show Edit/Delete buttons when user is not authenticated', async () => {
      renderWithAuth(<ArticleCard article={mockArticle} />);

      await waitFor(() => {
        expect(screen.queryByText(/edit/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/delete/i)).not.toBeInTheDocument();
      });
    });

    it('should NOT show Edit/Delete buttons when user is authenticated but not the author', async () => {
      const otherUser = { id: 2, username: 'otheruser' };
      localStorage.setItem('authToken', 'mock-token');
      localStorage.setItem('authUser', JSON.stringify(otherUser));
      authApi.getCurrentUser.mockResolvedValue(otherUser);

      renderWithAuth(<ArticleCard article={mockArticle} />);

      await waitFor(() => {
        expect(screen.queryByText(/edit/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/delete/i)).not.toBeInTheDocument();
      });
    });

    it('should show Edit/Delete buttons when user is authenticated and is the author', async () => {
      localStorage.setItem('authToken', 'mock-token');
      localStorage.setItem('authUser', JSON.stringify(mockUser));
      authApi.getCurrentUser.mockResolvedValue(mockUser);

      renderWithAuth(<ArticleCard article={mockArticle} />);

      await waitFor(() => {
        expect(screen.getByText(/edit/i)).toBeInTheDocument();
        expect(screen.getByText(/delete/i)).toBeInTheDocument();
      });
    });

    it('should call onEdit when Edit button is clicked', async () => {
      const onEdit = vi.fn();
      localStorage.setItem('authToken', 'mock-token');
      localStorage.setItem('authUser', JSON.stringify(mockUser));
      authApi.getCurrentUser.mockResolvedValue(mockUser);

      renderWithAuth(
        <ArticleCard
          article={mockArticle}
          onEdit={onEdit}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/edit/i)).toBeInTheDocument();
      });

      const editButton = screen.getByText(/edit/i);
      await userEvent.click(editButton);

      expect(onEdit).toHaveBeenCalledWith(mockArticle);
    });

    it('should call onDelete when Delete button is clicked', async () => {
      const onDelete = vi.fn();
      localStorage.setItem('authToken', 'mock-token');
      localStorage.setItem('authUser', JSON.stringify(mockUser));
      authApi.getCurrentUser.mockResolvedValue(mockUser);

      renderWithAuth(
        <ArticleCard
          article={mockArticle}
          onDelete={onDelete}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/delete/i)).toBeInTheDocument();
      });

      const deleteButton = screen.getByText(/delete/i);
      await userEvent.click(deleteButton);

      expect(onDelete).toHaveBeenCalledWith(mockArticle);
    });

    it('should prevent event propagation when Edit button is clicked', async () => {
      const onClick = vi.fn();
      const onEdit = vi.fn();
      localStorage.setItem('authToken', 'mock-token');
      localStorage.setItem('authUser', JSON.stringify(mockUser));
      authApi.getCurrentUser.mockResolvedValue(mockUser);

      renderWithAuth(
        <div onClick={onClick}>
          <ArticleCard
            article={mockArticle}
            onEdit={onEdit}
          />
        </div>
      );

      await waitFor(() => {
        expect(screen.getByText(/edit/i)).toBeInTheDocument();
      });

      const editButton = screen.getByText(/edit/i);
      await userEvent.click(editButton);

      expect(onEdit).toHaveBeenCalledWith(mockArticle);
      expect(onClick).not.toHaveBeenCalled();
    });

    it('should prevent event propagation when Delete button is clicked', async () => {
      const onClick = vi.fn();
      const onDelete = vi.fn();
      localStorage.setItem('authToken', 'mock-token');
      localStorage.setItem('authUser', JSON.stringify(mockUser));
      authApi.getCurrentUser.mockResolvedValue(mockUser);

      renderWithAuth(
        <div onClick={onClick}>
          <ArticleCard
            article={mockArticle}
            onDelete={onDelete}
          />
        </div>
      );

      await waitFor(() => {
        expect(screen.getByText(/delete/i)).toBeInTheDocument();
      });

      const deleteButton = screen.getByText(/delete/i);
      await userEvent.click(deleteButton);

      expect(onDelete).toHaveBeenCalledWith(mockArticle);
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('ArticleCard with authorId vs author object', () => {
    it('should work with authorId field', async () => {
      const articleWithAuthorId = {
        ...mockArticle,
        authorId: 1,
        author: undefined,
      };

      localStorage.setItem('authToken', 'mock-token');
      localStorage.setItem('authUser', JSON.stringify(mockUser));
      authApi.getCurrentUser.mockResolvedValue(mockUser);

      renderWithAuth(<ArticleCard article={articleWithAuthorId} />);

      await waitFor(() => {
        expect(screen.getByText(/edit/i)).toBeInTheDocument();
      });
    });

    it('should work with author object field', async () => {
      const articleWithAuthorObject = {
        ...mockArticle,
        authorId: undefined,
        author: { id: 1, username: 'testuser' },
      };

      localStorage.setItem('authToken', 'mock-token');
      localStorage.setItem('authUser', JSON.stringify(mockUser));
      authApi.getCurrentUser.mockResolvedValue(mockUser);

      renderWithAuth(<ArticleCard article={articleWithAuthorObject} />);

      await waitFor(() => {
        expect(screen.getByText(/edit/i)).toBeInTheDocument();
      });
    });
  });

  describe('showAvatar prop', () => {
    it('should render avatar when showAvatar is true', () => {
      renderWithAuth(<ArticleCard article={mockArticle} showAvatar={true} />);
      expect(screen.getByText('T')).toBeInTheDocument();
    });

    it('should not render avatar when showAvatar is false', () => {
      const { container } = renderWithAuth(
        <ArticleCard article={mockArticle} showAvatar={false} />
      );
      expect(container.querySelector('[class*="avatarSection"]')).toBeNull();
    });
  });
});