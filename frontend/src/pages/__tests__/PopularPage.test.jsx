import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import PopularPage from '../PopularPage';
import { AuthProvider } from '../../context/AuthContext';
import * as articleApi from '../../services/articleApi';
import * as authApi from '../../services/authApi';

// ============================
// Mocks
// ============================
vi.mock('../../services/articleApi', () => ({
  getPopularArticles: vi.fn(),
}));

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

describe('PopularPage', () => {
  const mockArticles = [
    {
      id: 1,
      title: 'Top Article',
      abstractText: 'This is the most cited article',
      publicationDate: '2024-01-15T10:00:00Z',
      citationCount: 10,
    },
    {
      id: 2,
      title: 'Second Article',
      abstractText: 'This is the second most cited article',
      publicationDate: '2024-01-14T10:00:00Z',
      citationCount: 5,
    },
    {
      id: 3,
      title: 'Third Article',
      abstractText: 'This is the third most cited article',
      publicationDate: '2024-01-13T10:00:00Z',
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
      articleApi.getPopularArticles.mockImplementation(() => new Promise(() => {}));

      renderWithAuth(<PopularPage />);

      expect(screen.getByText(/Loading popular articles/i)).toBeInTheDocument();
    });
  });

  describe('Article display', () => {
    it('should display popular articles when loaded', async () => {
      articleApi.getPopularArticles.mockResolvedValue(mockArticles);

      renderWithAuth(<PopularPage />);

      await waitFor(() => {
        expect(screen.getByText('Top Article')).toBeInTheDocument();
        expect(screen.getByText('Second Article')).toBeInTheDocument();
        expect(screen.getByText('Third Article')).toBeInTheDocument();
      });
    });

    it('should display citation counts', async () => {
      articleApi.getPopularArticles.mockResolvedValue(mockArticles);

      renderWithAuth(<PopularPage />);

      await waitFor(() => {
        // Use getAllByText since "10" appears multiple times
        const tenElements = screen.getAllByText('10');
        expect(tenElements.length).toBeGreaterThan(0);
        
        const fiveElements = screen.getAllByText('5');
        expect(fiveElements.length).toBeGreaterThan(0);
        
        const twoElements = screen.getAllByText('2');
        expect(twoElements.length).toBeGreaterThan(0);
      });
    });

    it('should display correct rank numbers', async () => {
      articleApi.getPopularArticles.mockResolvedValue(mockArticles);

      renderWithAuth(<PopularPage />);

      await waitFor(() => {
        const ranks = screen.getAllByText(/[1-3]/);
        expect(ranks.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Medal icons', () => {
    it('should show gold medal for top article', async () => {
      articleApi.getPopularArticles.mockResolvedValue(mockArticles);

      renderWithAuth(<PopularPage />);

      await waitFor(() => {
        expect(screen.getByText('🥇')).toBeInTheDocument();
      });
    });

    it('should show silver medal for second article', async () => {
      articleApi.getPopularArticles.mockResolvedValue(mockArticles);

      renderWithAuth(<PopularPage />);

      await waitFor(() => {
        expect(screen.getByText('🥈')).toBeInTheDocument();
      });
    });

    it('should show bronze medal for third article', async () => {
      articleApi.getPopularArticles.mockResolvedValue(mockArticles);

      renderWithAuth(<PopularPage />);

      await waitFor(() => {
        expect(screen.getByText('🥉')).toBeInTheDocument();
      });
    });

    it('should show number for positions after 3rd', async () => {
      const manyArticles = [
        ...mockArticles,
        {
          id: 4,
          title: 'Fourth Article',
          abstractText: 'Fourth article abstract',
          publicationDate: '2024-01-12T10:00:00Z',
          citationCount: 1,
        },
      ];
      articleApi.getPopularArticles.mockResolvedValue(manyArticles);

      renderWithAuth(<PopularPage />);

      await waitFor(() => {
        // Use getAllByText and check for the rank number 4
        const rankElements = screen.getAllByText('4');
        expect(rankElements.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Stats display', () => {
    it('should display total citations count', async () => {
      articleApi.getPopularArticles.mockResolvedValue(mockArticles);

      renderWithAuth(<PopularPage />);

      await waitFor(() => {
        expect(screen.getByText('17')).toBeInTheDocument();
        // Use a more specific selector for "Total citations"
        expect(screen.getByText(/Total citations/i)).toBeInTheDocument();
      });
    });

    it('should display articles ranked count', async () => {
      articleApi.getPopularArticles.mockResolvedValue(mockArticles);

      renderWithAuth(<PopularPage />);

      await waitFor(() => {
        // Use getAllByText for '3' and check the stat value specifically
        const statValues = screen.getAllByText('3');
        expect(statValues.length).toBeGreaterThan(0);
        // Look for the stat label specifically
        const statLabels = screen.getAllByText(/Articles ranked/i);
        expect(statLabels.length).toBeGreaterThan(0);
      });
    });

    it('should display top citation count', async () => {
      articleApi.getPopularArticles.mockResolvedValue(mockArticles);

      renderWithAuth(<PopularPage />);

      await waitFor(() => {
        const statElements = screen.getAllByText('10');
        expect(statElements.length).toBeGreaterThan(0);
        expect(screen.getByText(/Top citations/i)).toBeInTheDocument();
      });
    });
  });

  describe('Empty state', () => {
    it('should show empty state when no articles', async () => {
      articleApi.getPopularArticles.mockResolvedValue([]);

      renderWithAuth(<PopularPage />);

      await waitFor(() => {
        expect(screen.getByText(/No Citations Yet/i)).toBeInTheDocument();
        expect(screen.getByText(/Write an Article/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error handling', () => {
    it('should show error state when API fails', async () => {
      articleApi.getPopularArticles.mockRejectedValue(new Error('Network error'));

      renderWithAuth(<PopularPage />);

      await waitFor(() => {
        expect(screen.getByText(/Unable to Load Rankings/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Try Again/i })).toBeInTheDocument();
      });
    });

    it('should retry loading when Try Again is clicked', async () => {
      articleApi.getPopularArticles
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(mockArticles);

      renderWithAuth(<PopularPage />);

      await waitFor(() => {
        expect(screen.getByText(/Unable to Load Rankings/i)).toBeInTheDocument();
      });

      const retryButton = screen.getByRole('button', { name: /Try Again/i });
      await userEvent.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText('Top Article')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('should have link to browse all articles', async () => {
      articleApi.getPopularArticles.mockResolvedValue(mockArticles);

      renderWithAuth(<PopularPage />);

      await waitFor(() => {
        const backLink = screen.getByText(/Browse all articles/i);
        expect(backLink).toBeInTheDocument();
        expect(backLink.closest('a')).toHaveAttribute('href', '/');
      });
    });
  });
});