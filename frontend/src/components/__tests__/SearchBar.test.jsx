import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SearchBar from '../SearchBar';

describe('SearchBar Component', () => {
  let mockOnSearch;
  let mockOnClear;

  beforeEach(() => {
    mockOnSearch = vi.fn();
    mockOnClear = vi.fn();
  });

  it('should render search input', () => {
    render(<SearchBar onSearch={mockOnSearch} />);
    expect(screen.getByPlaceholderText(/Search articles/)).toBeInTheDocument();
  });

  it('should render search button', () => {
    render(<SearchBar onSearch={mockOnSearch} />);
    expect(screen.getByText('Search')).toBeInTheDocument();
  });

  it('should call onSearch when form is submitted', () => {
    render(<SearchBar onSearch={mockOnSearch} />);
    const input = screen.getByPlaceholderText(/Search articles/);
    const submitButton = screen.getByText('Search');

    fireEvent.change(input, { target: { value: 'React' } });
    fireEvent.click(submitButton);

    expect(mockOnSearch).toHaveBeenCalledWith('React');
  });

  it('should show clear button when text is entered', () => {
    render(<SearchBar onSearch={mockOnSearch} />);
    const input = screen.getByPlaceholderText(/Search articles/);

    fireEvent.change(input, { target: { value: 'test' } });

    const clearButton = screen.getByLabelText(/Clear search/i);
    expect(clearButton).toBeInTheDocument();
  });

  it('should clear search when clear button is clicked', () => {
    render(<SearchBar onSearch={mockOnSearch} />);
    const input = screen.getByPlaceholderText(/Search articles/);

    fireEvent.change(input, { target: { value: 'test' } });
    
    const clearButton = screen.getByLabelText(/Clear search/i);
    fireEvent.click(clearButton);

    expect(input.value).toBe('');
  });

  it('should show loading state', () => {
    render(<SearchBar onSearch={mockOnSearch} isLoading={true} />);
    const input = screen.getByPlaceholderText(/Search articles/);
    expect(input).toBeDisabled();
    const submitButton = screen.getByText('Search');
    expect(submitButton).toBeDisabled();
  });

  it('should show keyboard shortcut hint by default', () => {
    render(<SearchBar onSearch={mockOnSearch} />);
    expect(screen.getByText(/to search/)).toBeInTheDocument();
  });

  it('should call onClear when clear button is clicked', () => {
    render(<SearchBar onSearch={mockOnSearch} onClear={mockOnClear} />);
    const input = screen.getByPlaceholderText(/Search articles/);

    fireEvent.change(input, { target: { value: 'test' } });
    
    const clearButton = screen.getByLabelText(/Clear search/i);
    fireEvent.click(clearButton);

    expect(mockOnClear).toHaveBeenCalled();
  });
});