import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import HomePage from '../HomePage';
import { AuthProvider } from '../../context/AuthContext';
import * as articleApi from '../../services/articleApi';
import * as authApi from '../../services/authApi';

// ============================
// Mocks
// ============================
vi.mock('../../services/articleApi', () => ({
  getAllArticles: vi.fn(),
  searchArticles: vi.fn(),
}));

vi.mock('../../services/authApi', () => ({
  getCurrentUser: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

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

describe('HomePage', () => {
  const mockArticles = [
    {
      id: 1,
      title: 'Test Article',
      abstractText: 'This is a test abstract',
      publicationDate: '2024-01-15T10:00:00Z',
      citationCount: 5,
    },
    {
      id: 2,
      title: 'Another Article',
      abstractText: 'Another test abstract',
      publicationDate: '2024-01-14T10:00:00Z',
      citationCount: 2,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    authApi.getCurrentUser.mockResolvedValue({ id: 1, username: 'testuser' });
  });

  describe('Loading state', () => {
    it('should show loading spinner while fetching articles', () => {
      articleApi.getAllArticles.mockImplementation(() => new Promise(() => {}));

      renderWithAuth(<HomePage />);

      expect(screen.getByText(/Loading articles/i)).toBeInTheDocument();
    });
  });

  describe('Article display', () => {
    it('should display articles when loaded', async () => {
      articleApi.getAllArticles.mockResolvedValue(mockArticles);

      renderWithAuth(<HomePage />);

      await waitFor(() => {
        expect(screen.getByText('Test Article')).toBeInTheDocument();
        expect(screen.getByText('Another Article')).toBeInTheDocument();
      });
    });

    it('should display "Newest" badge on the first article', async () => {
      articleApi.getAllArticles.mockResolvedValue(mockArticles);

      renderWithAuth(<HomePage />);

      await waitFor(() => {
        expect(screen.getByText('Newest')).toBeInTheDocument();
      });
    });

    it('should show article count', async () => {
      articleApi.getAllArticles.mockResolvedValue(mockArticles);

      renderWithAuth(<HomePage />);

      await waitFor(() => {
        expect(screen.getByText('2 articles')).toBeInTheDocument();
      });
    });
  });

  describe('Search functionality', () => {
    it('should search articles when typing in search bar', async () => {
      articleApi.getAllArticles.mockResolvedValue(mockArticles);
      articleApi.searchArticles.mockResolvedValue([
        {
          id: 3,
          title: 'Search Result',
          abstractText: 'Search result abstract',
          publicationDate: '2024-01-16T10:00:00Z',
          citationCount: 0,
        },
      ]);

      renderWithAuth(<HomePage />);

      await waitFor(() => {
        expect(screen.getByText('Test Article')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/Search articles/i);
      await userEvent.type(searchInput, 'Search');

      await waitFor(() => {
        expect(articleApi.searchArticles).toHaveBeenCalledWith('Search');
        expect(screen.getByText('Search Result')).toBeInTheDocument();
        expect(screen.queryByText('Test Article')).not.toBeInTheDocument();
      });
    });

    it('should show search results count', async () => {
      articleApi.getAllArticles.mockResolvedValue(mockArticles);
      articleApi.searchArticles.mockResolvedValue([
        {
          id: 3,
          title: 'Search Result',
          abstractText: 'Search result abstract',
          publicationDate: '2024-01-16T10:00:00Z',
          citationCount: 0,
        },
      ]);

      renderWithAuth(<HomePage />);

      await waitFor(() => {
        expect(screen.getByText('Test Article')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/Search articles/i);
      await userEvent.type(searchInput, 'Search');

      await waitFor(() => {
        expect(screen.getByText('Found 1 result')).toBeInTheDocument();
      });
    });

    it('should clear search and show all articles', async () => {
      articleApi.getAllArticles.mockResolvedValue(mockArticles);
      articleApi.searchArticles.mockResolvedValue([]);

      renderWithAuth(<HomePage />);

      await waitFor(() => {
        expect(screen.getByText('Test Article')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/Search articles/i);
      await userEvent.type(searchInput, 'NonExistent');

      await waitFor(() => {
        expect(screen.getByText('No matching articles found')).toBeInTheDocument();
      });

      // Click the clear button by its aria-label
      const clearButton = screen.getByLabelText(/Clear search/i);
      await userEvent.click(clearButton);

      await waitFor(() => {
        expect(articleApi.getAllArticles).toHaveBeenCalled();
        expect(screen.getByText('Test Article')).toBeInTheDocument();
      });
    });
  });

  describe('Empty state', () => {
    it('should show empty state when no articles', async () => {
      // Mock authenticated user
      authApi.getCurrentUser.mockResolvedValue({ id: 1, username: 'testuser' });
      localStorage.setItem('authToken', 'mock-token');
      localStorage.setItem('authUser', JSON.stringify({ id: 1, username: 'testuser' }));
      articleApi.getAllArticles.mockResolvedValue([]);

      renderWithAuth(<HomePage />);

      await waitFor(() => {
        expect(screen.getByText(/No articles yet/i)).toBeInTheDocument();
        expect(screen.getByText(/Add Your First Article/i)).toBeInTheDocument();
      });
    });

    it('should show empty search results message', async () => {
      articleApi.getAllArticles.mockResolvedValue(mockArticles);
      articleApi.searchArticles.mockResolvedValue([]);

      renderWithAuth(<HomePage />);

      await waitFor(() => {
        expect(screen.getByText('Test Article')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/Search articles/i);
      await userEvent.type(searchInput, 'NonExistent');

      await waitFor(() => {
        expect(screen.getByText(/No matching articles found/i)).toBeInTheDocument();
        expect(screen.getByText(/Try a different search term/i)).toBeInTheDocument();
      });
    });

    it('should show login link in empty state when not authenticated', async () => {
      authApi.getCurrentUser.mockRejectedValue(new Error('Not authenticated'));
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      articleApi.getAllArticles.mockResolvedValue([]);

      renderWithAuth(<HomePage />);

      await waitFor(() => {
        expect(screen.getByText(/Login to Write/i)).toBeInTheDocument();
        expect(screen.queryByText(/Add Your First Article/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Error handling', () => {
    it('should show error state when API fails', async () => {
      articleApi.getAllArticles.mockRejectedValue(new Error('Network error'));

      renderWithAuth(<HomePage />);

      await waitFor(() => {
        expect(screen.getByText(/Failed to load articles/i)).toBeInTheDocument();
        expect(screen.getByText(/Try Again/i)).toBeInTheDocument();
      });
    });

    it('should retry loading when Try Again is clicked', async () => {
      articleApi.getAllArticles
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(mockArticles);

      renderWithAuth(<HomePage />);

      await waitFor(() => {
        expect(screen.getByText(/Failed to load articles/i)).toBeInTheDocument();
      });

      const retryButton = screen.getByText(/Try Again/i);
      await userEvent.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText('Test Article')).toBeInTheDocument();
      });
    });
  });

  describe('Authentication-aware rendering', () => {
    it('should show "Write New Article" button when authenticated', async () => {
      authApi.getCurrentUser.mockResolvedValue({ id: 1, username: 'testuser' });
      localStorage.setItem('authToken', 'mock-token');
      localStorage.setItem('authUser', JSON.stringify({ id: 1, username: 'testuser' }));
      articleApi.getAllArticles.mockResolvedValue(mockArticles);

      renderWithAuth(<HomePage />);

      await waitFor(() => {
        expect(screen.getByText(/Write New Article/i)).toBeInTheDocument();
      });
    });

    it('should NOT show "Write New Article" button when not authenticated', async () => {
      authApi.getCurrentUser.mockRejectedValue(new Error('Not authenticated'));
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      articleApi.getAllArticles.mockResolvedValue(mockArticles);

      renderWithAuth(<HomePage />);

      await waitFor(() => {
        expect(screen.queryByText(/Write New Article/i)).not.toBeInTheDocument();
      });
    });
  });
});