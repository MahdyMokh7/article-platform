import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PopularPage from '../PopularPage';
import * as api from '../../services/api';

vi.mock('../../services/api', () => ({
  getPopularArticles: vi.fn(),
}));

const renderWithRouter = (component) => render(<BrowserRouter>{component}</BrowserRouter>);

describe('PopularPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows loading then articles', async () => {
    api.getPopularArticles.mockResolvedValue([{ 
      id: 1, 
      title: 'Top Article', 
      abstractText: '', 
      publicationDate: '2024-01-01', 
      citationCount: 10 
    }]);
    
    renderWithRouter(<PopularPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Top Article')).toBeInTheDocument();
    });
  });

  it('shows empty state', async () => {
    api.getPopularArticles.mockResolvedValue([]);
    renderWithRouter(<PopularPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/No Citations Yet/i)).toBeInTheDocument();
    });
  });

  it('shows medal for top article', async () => {
    api.getPopularArticles.mockResolvedValue([
      { id: 1, title: 'Gold', abstractText: '', publicationDate: '2024-01-01', citationCount: 10 },
      { id: 2, title: 'Silver', abstractText: '', publicationDate: '2024-01-02', citationCount: 5 },
    ]);
    
    renderWithRouter(<PopularPage />);
    
    await waitFor(() => {
      expect(screen.getByText('🥇')).toBeInTheDocument();
      expect(screen.getByText('🥈')).toBeInTheDocument();
    });
  });

  it('shows error state', async () => {
    api.getPopularArticles.mockRejectedValue(new Error('Network error'));
    renderWithRouter(<PopularPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/Unable to Load Rankings/i)).toBeInTheDocument();
    });
  });
});