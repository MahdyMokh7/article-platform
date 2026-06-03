import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import HomePage from '../HomePage';
import * as api from '../../services/api';

vi.mock('../../services/api', () => ({
  getAllArticles: vi.fn(),
  searchArticles: vi.fn(),
}));

const renderWithRouter = (component) => render(<BrowserRouter>{component}</BrowserRouter>);

describe('HomePage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows loading then articles', async () => {
    api.getAllArticles.mockResolvedValue([{ 
      id: 1, 
      title: 'Test Article', 
      abstractText: 'Abstract', 
      publicationDate: '2024-01-01', 
      citationCount: 0 
    }]);
    
    renderWithRouter(<HomePage />);
    
    // Wait for articles to load
    await waitFor(() => {
      expect(screen.getByText('Test Article')).toBeInTheDocument();
    });
  });

  it('shows empty state', async () => {
    api.getAllArticles.mockResolvedValue([]);
    renderWithRouter(<HomePage />);
    
    await waitFor(() => {
      expect(screen.getByText(/No articles yet/i)).toBeInTheDocument();
    });
  });

  it('shows error state', async () => {
    api.getAllArticles.mockRejectedValue(new Error('Network error'));
    renderWithRouter(<HomePage />);
    
    await waitFor(() => {
      expect(screen.getByText(/Failed to load articles/i)).toBeInTheDocument();
    });
  });

  it('searches articles', async () => {
    api.getAllArticles.mockResolvedValue([{ 
      id: 1, 
      title: 'Original', 
      abstractText: '', 
      publicationDate: '2024-01-01', 
      citationCount: 0 
    }]);
    api.searchArticles.mockResolvedValue([{ 
      id: 2, 
      title: 'Search Result', 
      abstractText: '', 
      publicationDate: '2024-01-02', 
      citationCount: 0 
    }]);
    
    renderWithRouter(<HomePage />);
    await waitFor(() => expect(screen.getByText('Original')).toBeInTheDocument());
    
    const input = screen.getByPlaceholderText(/Search/i);
    await userEvent.type(input, 'test');
    
    await waitFor(() => {
      expect(api.searchArticles).toHaveBeenCalledWith('test');
    });
  });
});