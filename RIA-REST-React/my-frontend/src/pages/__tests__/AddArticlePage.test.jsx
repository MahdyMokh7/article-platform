import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AddArticlePage from '../AddArticlePage';
import * as api from '../../services/api';

vi.mock('../../services/api', () => ({
  createArticle: vi.fn(),
  checkTitleAvailability: vi.fn(),
  getAllArticles: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const renderPage = () => render(
  <BrowserRouter>
    <AddArticlePage />
  </BrowserRouter>
);

describe('AddArticlePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.getAllArticles.mockResolvedValue([]);
    api.checkTitleAvailability.mockResolvedValue(true);
  });

  it('renders all form fields', () => {
    renderPage();
    expect(screen.getByPlaceholderText(/Enter a compelling title/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Write your article content/i)).toBeInTheDocument();
    expect(screen.getByText(/Publish Article/i)).toBeInTheDocument();
  });

  it('shows title available message for unique title', async () => {
    renderPage();
    
    const titleInput = screen.getByPlaceholderText(/Enter a compelling title/i);
    fireEvent.change(titleInput, { target: { value: 'Unique Title' } });
    fireEvent.blur(titleInput);
    
    await waitFor(() => {
      expect(screen.getByText('✓ Title available')).toBeInTheDocument();
    });
  });

  it('shows error for duplicate title', async () => {
    api.checkTitleAvailability.mockResolvedValue(false);
    renderPage();
    
    const titleInput = screen.getByPlaceholderText(/Enter a compelling title/i);
    fireEvent.change(titleInput, { target: { value: 'Existing Title' } });
    fireEvent.blur(titleInput);
    
    await waitFor(() => {
      expect(screen.getByText(/already exists/i)).toBeInTheDocument();
    });
  });

  it('submits form successfully', async () => {
    api.createArticle.mockResolvedValue({ id: 1, title: 'New Article' });
    renderPage();
    
    const titleInput = screen.getByPlaceholderText(/Enter a compelling title/i);
    const bodyInput = screen.getByPlaceholderText(/Write your article content/i);
    
    fireEvent.change(titleInput, { target: { value: 'New Article' } });
    fireEvent.change(bodyInput, { target: { value: 'Body content' } });
    
    const submitButton = screen.getByText(/Publish Article/i);
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(api.createArticle).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalled();
    });
  });

  it('navigates back on cancel', () => {
    renderPage();
    fireEvent.click(screen.getByText(/Cancel/i));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('disables submit button when form is invalid', () => {
    renderPage();
    const submitButton = screen.getByText(/Publish Article/i);
    // Submit button is disabled when title or body is empty
    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when form is valid', async () => {
    renderPage();
    
    const titleInput = screen.getByPlaceholderText(/Enter a compelling title/i);
    const bodyInput = screen.getByPlaceholderText(/Write your article content/i);
    
    fireEvent.change(titleInput, { target: { value: 'Valid Title' } });
    fireEvent.change(bodyInput, { target: { value: 'Valid body content' } });
    
    await waitFor(() => {
      const submitButton = screen.getByText(/Publish Article/i);
      expect(submitButton).not.toBeDisabled();
    });
  });
});