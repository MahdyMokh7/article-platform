/**
 * AddArticlePage Component Tests
 *
 * Tests for article creation form, validation, and submission
 *
 * @module pages/__tests__/AddArticlePage.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import AddArticlePage from '../AddArticlePage';
import { AuthProvider } from '../../context/AuthContext';
import * as articleApi from '../../services/articleApi';
import * as authApi from '../../services/authApi';

// ============================
// Mocks
// ============================
vi.mock('../../services/articleApi', () => ({
  createArticle: vi.fn(),
  checkTitleAvailability: vi.fn(),
  getAllArticles: vi.fn(),
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

describe('AddArticlePage', () => {
  const mockArticles = [
    { id: 1, title: 'Existing Article 1', citationCount: 0 },
    { id: 2, title: 'Existing Article 2', citationCount: 2 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    articleApi.getAllArticles.mockResolvedValue(mockArticles);
    articleApi.checkTitleAvailability.mockResolvedValue(true);
    authApi.getCurrentUser.mockResolvedValue({ id: 1, username: 'testuser' });
  });

  describe('Rendering', () => {
    it('should render all form fields', async () => {
      renderWithAuth(<AddArticlePage />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Enter a compelling title/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Write your article content/i)).toBeInTheDocument();
        expect(screen.getByText(/Publish Article/i)).toBeInTheDocument();
      });
    });

    it('should show abstract textarea', async () => {
      renderWithAuth(<AddArticlePage />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/A brief summary of your article/i)).toBeInTheDocument();
      });
    });

    it('should show references section when articles exist', async () => {
      articleApi.getAllArticles.mockResolvedValue(mockArticles);

      renderWithAuth(<AddArticlePage />);

      await waitFor(() => {
        expect(screen.getByText(/📚 References/)).toBeInTheDocument();
      });
    });
  });

  describe('Title Validation', () => {
    it('should show title availability message', async () => {
      articleApi.checkTitleAvailability.mockResolvedValue(true);

      renderWithAuth(<AddArticlePage />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Enter a compelling title/i)).toBeInTheDocument();
      });

      const titleInput = screen.getByPlaceholderText(/Enter a compelling title/i);
      await userEvent.type(titleInput, 'Unique Title');
      await userEvent.tab();

      await waitFor(() => {
        expect(screen.getByText(/✓ Title available/i)).toBeInTheDocument();
      });
    });

    it('should show error for duplicate title', async () => {
      articleApi.checkTitleAvailability.mockResolvedValue(false);

      renderWithAuth(<AddArticlePage />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Enter a compelling title/i)).toBeInTheDocument();
      });

      const titleInput = screen.getByPlaceholderText(/Enter a compelling title/i);
      await userEvent.type(titleInput, 'Existing Title');
      await userEvent.tab();

      await waitFor(() => {
        expect(screen.getByText(/already exists/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('should submit form successfully and navigate to article', async () => {
      const createdArticle = { id: 5, title: 'New Article' };
      articleApi.createArticle.mockResolvedValue(createdArticle);
      articleApi.checkTitleAvailability.mockResolvedValue(true);

      renderWithAuth(<AddArticlePage />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Enter a compelling title/i)).toBeInTheDocument();
      });

      const titleInput = screen.getByPlaceholderText(/Enter a compelling title/i);
      const bodyInput = screen.getByPlaceholderText(/Write your article content/i);

      await userEvent.type(titleInput, 'New Article');
      await userEvent.type(bodyInput, 'Body content');

      const submitButton = screen.getByText(/Publish Article/i);
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(articleApi.createArticle).toHaveBeenCalledWith({
          title: 'New Article',
          abstractText: '',
          body: 'Body content',
          referenceIds: [],
        });
        expect(mockNavigate).toHaveBeenCalledWith('/article/5');
      });
    });

    it('should include abstract text when provided', async () => {
      const createdArticle = { id: 5, title: 'New Article' };
      articleApi.createArticle.mockResolvedValue(createdArticle);

      renderWithAuth(<AddArticlePage />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Enter a compelling title/i)).toBeInTheDocument();
      });

      const titleInput = screen.getByPlaceholderText(/Enter a compelling title/i);
      const abstractInput = screen.getByPlaceholderText(/A brief summary of your article/i);
      const bodyInput = screen.getByPlaceholderText(/Write your article content/i);

      await userEvent.type(titleInput, 'New Article');
      await userEvent.type(abstractInput, 'Test Abstract');
      await userEvent.type(bodyInput, 'Body content');

      const submitButton = screen.getByText(/Publish Article/i);
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(articleApi.createArticle).toHaveBeenCalledWith({
          title: 'New Article',
          abstractText: 'Test Abstract',
          body: 'Body content',
          referenceIds: [],
        });
      });
    });

    it('should show error when duplicate title on submit', async () => {
      articleApi.createArticle.mockRejectedValue({
        response: { status: 409, data: { message: 'Title already exists' } },
      });

      renderWithAuth(<AddArticlePage />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Enter a compelling title/i)).toBeInTheDocument();
      });

      const titleInput = screen.getByPlaceholderText(/Enter a compelling title/i);
      const bodyInput = screen.getByPlaceholderText(/Write your article content/i);

      await userEvent.type(titleInput, 'Duplicate Title');
      await userEvent.type(bodyInput, 'Body content');

      const submitButton = screen.getByText(/Publish Article/i);
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Title already exists/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Validation', () => {
    it('should disable submit button when form is invalid', async () => {
      renderWithAuth(<AddArticlePage />);

      await waitFor(() => {
        expect(screen.getByText(/Publish Article/i)).toBeInTheDocument();
      });

      const submitButton = screen.getByText(/Publish Article/i);
      expect(submitButton).toBeDisabled();
    });

    it('should enable submit button when form is valid', async () => {
      articleApi.checkTitleAvailability.mockResolvedValue(true);

      renderWithAuth(<AddArticlePage />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Enter a compelling title/i)).toBeInTheDocument();
      });

      const titleInput = screen.getByPlaceholderText(/Enter a compelling title/i);
      const bodyInput = screen.getByPlaceholderText(/Write your article content/i);

      await userEvent.type(titleInput, 'Valid Title');
      await userEvent.type(bodyInput, 'Valid body content');
      await userEvent.tab();

      await waitFor(() => {
        const submitButton = screen.getByText(/Publish Article/i);
        expect(submitButton).not.toBeDisabled();
      });
    });

    it('should show abstract character counter', async () => {
      renderWithAuth(<AddArticlePage />);

      await waitFor(() => {
        expect(screen.getByText(/0\/500 characters/)).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate back to home on cancel', async () => {
      renderWithAuth(<AddArticlePage />);

      await waitFor(() => {
        expect(screen.getByText(/Cancel/i)).toBeInTheDocument();
      });

      const cancelButton = screen.getByText(/Cancel/i);
      await userEvent.click(cancelButton);

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  describe('Reference Selection', () => {
    it('should show selected references count', async () => {
      articleApi.getAllArticles.mockResolvedValue(mockArticles);

      renderWithAuth(<AddArticlePage />);

      await waitFor(() => {
        expect(screen.getByText(/📚 References/)).toBeInTheDocument();
      });

      const checkboxes = screen.getAllByRole('checkbox');
      await userEvent.click(checkboxes[0]);
      await userEvent.click(checkboxes[1]);

      await waitFor(() => {
        expect(screen.getByText(/Selected 2 references/)).toBeInTheDocument();
      });
    });
  });
});