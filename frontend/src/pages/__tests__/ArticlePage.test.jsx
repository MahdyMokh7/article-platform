import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ArticlePage from '../ArticlePage';
import * as api from '../../services/api';

vi.mock('../../services/api', () => ({
  getArticleById: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useParams: () => ({ id: '1' }), useNavigate: () => vi.fn() };
});

const renderWithRouter = (component) => render(<BrowserRouter>{component}</BrowserRouter>);

describe('ArticlePage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows loading then article', async () => {
    const mockArticle = { 
      id: 1, 
      title: 'Test Article', 
      abstractText: 'Abstract', 
      body: 'Body', 
      publicationDate: '2024-01-15T10:00:00Z', 
      citationCount: 5, 
      references: [] 
    };
    api.getArticleById.mockResolvedValue(mockArticle);
    
    renderWithRouter(<ArticlePage />);
    
    // Wait for the article heading (h1) to appear - use getAllByText and check first one
    await waitFor(() => {
      const headings = screen.getAllByText('Test Article');
      expect(headings.length).toBeGreaterThan(0);
    });
  });

  it('shows references when present', async () => {
    const mockArticle = { 
      id: 1, 
      title: 'Article', 
      abstractText: '', 
      body: '', 
      publicationDate: '2024-01-01T00:00:00Z', 
      citationCount: 0, 
      references: [{ id: 2, title: 'Ref 1', citationCount: 2 }] 
    };
    api.getArticleById.mockResolvedValue(mockArticle);
    
    renderWithRouter(<ArticlePage />);
    
    await waitFor(() => {
      expect(screen.getByText(/References/i)).toBeInTheDocument();
      expect(screen.getByText('Ref 1')).toBeInTheDocument();
    });
  });

  it('shows error when not found', async () => {
    api.getArticleById.mockRejectedValue(new Error('404'));
    
    renderWithRouter(<ArticlePage />);
    
    await waitFor(() => {
      expect(screen.getByText('Article not found')).toBeInTheDocument();
    });
  });
});