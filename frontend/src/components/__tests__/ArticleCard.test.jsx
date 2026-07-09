import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ArticleCard from '../ArticleCard';

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('ArticleCard Component', () => {
  const mockArticle = {
    id: 1,
    title: 'Test Article Title',
    abstractText: 'This is a test abstract for the article card component.',
    publicationDate: '2024-01-15T10:00:00Z',
    citationCount: 5,
  };

  it('should render article title', () => {
    renderWithRouter(<ArticleCard article={mockArticle} />);
    expect(screen.getByText('Test Article Title')).toBeInTheDocument();
  });

  it('should render formatted date', () => {
    renderWithRouter(<ArticleCard article={mockArticle} />);
    expect(screen.getByText(/January 15, 2024/)).toBeInTheDocument();
  });

  it('should render abstract text', () => {
    renderWithRouter(<ArticleCard article={mockArticle} />);
    expect(screen.getByText(/test abstract/)).toBeInTheDocument();
  });

  it('should render citation count as a number in badge', () => {
    renderWithRouter(<ArticleCard article={mockArticle} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('should have tooltip with citation text', () => {
    renderWithRouter(<ArticleCard article={mockArticle} />);
    const badge = screen.getByTitle('Cited 5 times');
    expect(badge).toBeInTheDocument();
  });

  it('should render read more link', () => {
    renderWithRouter(<ArticleCard article={mockArticle} />);
    const readMoreLink = screen.getByText(/Read full article/);
    expect(readMoreLink.closest('a')).toHaveAttribute('href', '/article/1');
  });

  it('should handle article without abstract', () => {
    const articleWithoutAbstract = {
      ...mockArticle,
      abstractText: null,
    };
    renderWithRouter(<ArticleCard article={articleWithoutAbstract} />);
    expect(screen.queryByText(/abstract/)).not.toBeInTheDocument();
  });

  it('should NOT show citation badge when citation count is zero', () => {
    const articleNoCitations = {
      ...mockArticle,
      citationCount: 0,
    };
    renderWithRouter(<ArticleCard article={articleNoCitations} />);
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('should return null if article is missing', () => {
    const { container } = renderWithRouter(<ArticleCard article={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('should apply compact class when compact prop is true', () => {
    const { container } = renderWithRouter(<ArticleCard article={mockArticle} compact={true} />);
    expect(container.firstChild).toHaveClass(/compact/);
  });
});