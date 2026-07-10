/**
 * Footer Component Tests
 *
 * Tests for footer rendering, copyright text, author info, and social links
 *
 * @module components/__tests__/Footer.test
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Footer from '../Footer';

// ============================
// Test wrapper
// ============================
const renderFooter = () => {
  return render(
    <BrowserRouter>
      <Footer />
    </BrowserRouter>
  );
};

describe('Footer', () => {
  describe('Rendering', () => {
    it('should render the footer container', () => {
      renderFooter();
      const footer = document.querySelector('footer');
      expect(footer).toBeInTheDocument();
    });

    it('should render author name', () => {
      renderFooter();
      // Use getAllByText and check the first one (author name, not copyright)
      const authorNames = screen.getAllByText('Mehdy Mokhtari');
      expect(authorNames.length).toBe(2); // One in author section, one in copyright
      expect(authorNames[0]).toBeInTheDocument();
    });

    it('should render author title', () => {
      renderFooter();
      expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    });

    it('should render avatar image', () => {
      renderFooter();
      const avatar = document.querySelector('img');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveAttribute('src', '/mehdy-avatar.jpg');
      expect(avatar).toHaveAttribute('alt', 'Mehdy Mokhtari');
    });

    it('should render copyright text', () => {
      renderFooter();
      const year = new Date().getFullYear();
      // Use a function to match the text that might be split across elements
      expect(screen.getByText((content, element) => {
        return content.includes(`©`) && content.includes(`${year}`) && content.includes('Article Platform');
      })).toBeInTheDocument();
    });

        it('should render copyright with author highlight', () => {
        renderFooter();
        const highlights = screen.getAllByText('Mehdy Mokhtari');
        expect(highlights[1].className).toMatch(/authorHighlight/);
        });
  });

  describe('Social Links', () => {
    it('should render GitHub link', () => {
      renderFooter();
      const githubLink = screen.getByLabelText('GitHub');
      expect(githubLink).toBeInTheDocument();
      expect(githubLink).toHaveAttribute('href', 'https://github.com/MahdyMokh7');
      expect(githubLink).toHaveAttribute('target', '_blank');
      expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('should render LinkedIn link', () => {
      renderFooter();
      const linkedinLink = screen.getByLabelText('LinkedIn');
      expect(linkedinLink).toBeInTheDocument();
      expect(linkedinLink).toHaveAttribute('href', 'https://linkedin.com/in/mehdymokhtari');
      expect(linkedinLink).toHaveAttribute('target', '_blank');
      expect(linkedinLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('should render social link icons', () => {
      renderFooter();
      expect(screen.getByText('🐙')).toBeInTheDocument();
      expect(screen.getByText('🔗')).toBeInTheDocument();
    });
  });

  describe('Copyright Year', () => {
    it('should display current year', () => {
      renderFooter();
      const year = new Date().getFullYear();
      const yearString = year.toString();
      // Use a function to find the year in the text content
      expect(screen.getByText((content) => {
        return content.includes(yearString);
      })).toBeInTheDocument();
    });
  });

  describe('Structure', () => {
    it('should have correct semantic HTML structure', () => {
      renderFooter();
      const footer = document.querySelector('footer');
      expect(footer).toBeInTheDocument();

      const container = footer?.querySelector('div');
      // CSS modules add hashed class names, so check if it has a class that starts with 'container'
      expect(container?.className).toMatch(/container/);

      const content = container?.querySelector('div');
      expect(content?.className).toMatch(/content/);
    });

    it('should have author section with avatar and info', () => {
      renderFooter();
      const avatarWrapper = document.querySelector('[class*="avatarWrapper"]');
      const avatar = document.querySelector('[class*="avatar"]');
      const authorNames = screen.getAllByText('Mehdy Mokhtari');
      const authorTitle = screen.getByText('Software Engineer');

      expect(avatarWrapper).toBeInTheDocument();
      expect(avatar).toBeInTheDocument();
      expect(authorNames.length).toBeGreaterThan(0);
      expect(authorTitle).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible social links with aria-labels', () => {
      renderFooter();
      const githubLink = screen.getByLabelText('GitHub');
      const linkedinLink = screen.getByLabelText('LinkedIn');

      expect(githubLink).toHaveAttribute('aria-label', 'GitHub');
      expect(linkedinLink).toHaveAttribute('aria-label', 'LinkedIn');
    });
  });
});