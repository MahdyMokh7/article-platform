import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from '../Navbar';

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Navbar Component', () => {
it('should render logo/brand name', () => {
  renderWithRouter(<Navbar />);
  expect(screen.getByText('Article')).toBeInTheDocument();
  expect(screen.getByText('Platform')).toBeInTheDocument();
});

  it('should render logo icon', () => {
    renderWithRouter(<Navbar />);
    expect(screen.getByText('📚')).toBeInTheDocument();
  });

  // Use getAllByText and pick the first one (desktop nav)
  it('should render Home link', () => {
    renderWithRouter(<Navbar />);
    const homeLinks = screen.getAllByText('Home');
    expect(homeLinks.length).toBeGreaterThan(0);
  });

  it('should render Add Article link', () => {
    renderWithRouter(<Navbar />);
    const addLinks = screen.getAllByText('Add Article');
    expect(addLinks.length).toBeGreaterThan(0);
  });

  it('should render Popular link', () => {
    renderWithRouter(<Navbar />);
    const popularLinks = screen.getAllByText('Popular');
    expect(popularLinks.length).toBeGreaterThan(0);
  });

  // Target desktop navigation specifically
  it('should have correct href for Home link', () => {
    renderWithRouter(<Navbar />);
    const homeLinks = screen.getAllByText('Home');
    const homeLink = homeLinks[0]; // First one is desktop nav
    expect(homeLink.closest('a')).toHaveAttribute('href', '/');
  });

  it('should have correct href for Add Article link', () => {
    renderWithRouter(<Navbar />);
    const addLinks = screen.getAllByText('Add Article');
    const addLink = addLinks[0];
    expect(addLink.closest('a')).toHaveAttribute('href', '/add');
  });

  it('should have correct href for Popular link', () => {
    renderWithRouter(<Navbar />);
    const popularLinks = screen.getAllByText('Popular');
    const popularLink = popularLinks[0];
    expect(popularLink.closest('a')).toHaveAttribute('href', '/popular');
  });

  it('should render search button (disabled)', () => {
    renderWithRouter(<Navbar />);
    const searchButton = screen.getByLabelText(/Search articles/i);
    expect(searchButton).toBeDisabled();
  });

  it('should have skip to content link', () => {
    renderWithRouter(<Navbar />);
    const skipLink = screen.getByText(/Skip to main content/i);
    expect(skipLink).toBeInTheDocument();
  });

  it('should render mobile menu button', () => {
    renderWithRouter(<Navbar />);
    const menuButton = screen.getByLabelText(/Open menu/i);
    expect(menuButton).toBeInTheDocument();
  });
});