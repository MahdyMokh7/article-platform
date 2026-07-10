/**
 * Helpers Unit Tests
 *
 * Tests for all helper utility functions
 *
 * @module utils/helpers.test
 */

import { describe, it, expect } from 'vitest';
import {
  isArticleAuthor,
  isAuthenticated,
  getUserInitials,
  formatDate,
  truncateText,
} from '../helpers';

describe('isArticleAuthor', () => {
  it('should return false when article or user is missing', () => {
    expect(isArticleAuthor(null, null)).toBe(false);
    expect(isArticleAuthor({ id: 1 }, null)).toBe(false);
    expect(isArticleAuthor(null, { id: 1 })).toBe(false);
  });

  it('should return true when authorId matches user id', () => {
    const article = { id: 1, authorId: 5 };
    const user = { id: 5, username: 'john' };
    expect(isArticleAuthor(article, user)).toBe(true);
  });

  it('should return true when author.id matches user id', () => {
    const article = { id: 1, author: { id: 5, username: 'john' } };
    const user = { id: 5, username: 'john' };
    expect(isArticleAuthor(article, user)).toBe(true);
  });

  it('should return false when authorId does not match', () => {
    const article = { id: 1, authorId: 5 };
    const user = { id: 10, username: 'john' };
    expect(isArticleAuthor(article, user)).toBe(false);
  });

  it('should return false when author.id does not match', () => {
    const article = { id: 1, author: { id: 5, username: 'john' } };
    const user = { id: 10, username: 'john' };
    expect(isArticleAuthor(article, user)).toBe(false);
  });
});

describe('isAuthenticated', () => {
  it('should return false when user is null or undefined', () => {
    expect(isAuthenticated(null)).toBe(false);
    expect(isAuthenticated(undefined)).toBe(false);
  });

  it('should return false when user has no id', () => {
    expect(isAuthenticated({})).toBe(false);
    expect(isAuthenticated({ username: 'john' })).toBe(false);
  });

  it('should return true when user has an id', () => {
    expect(isAuthenticated({ id: 1 })).toBe(true);
    expect(isAuthenticated({ id: 5, username: 'john' })).toBe(true);
  });
});

describe('getUserInitials', () => {
  it('should return "U" for empty username', () => {
    expect(getUserInitials('')).toBe('U');
    expect(getUserInitials(null)).toBe('U');
    expect(getUserInitials(undefined)).toBe('U');
  });

  it('should return first character uppercase for single word', () => {
    expect(getUserInitials('john')).toBe('J');
    expect(getUserInitials('John')).toBe('J');
    expect(getUserInitials('j')).toBe('J');
  });

  it('should return first character uppercase for multi-word', () => {
    expect(getUserInitials('john_doe')).toBe('J');
    expect(getUserInitials('John_Doe')).toBe('J');
  });
});

describe('formatDate', () => {
  it('should return "Date unknown" for null or undefined', () => {
    expect(formatDate(null)).toBe('Date unknown');
    expect(formatDate(undefined)).toBe('Date unknown');
    expect(formatDate('')).toBe('Date unknown');
  });

  it('should return "Invalid date" for invalid date string', () => {
    expect(formatDate('invalid')).toBe('Invalid date');
  });

  it('should format valid date correctly', () => {
    const date = '2024-01-15T10:30:00Z';
    const result = formatDate(date);
    expect(result).toBe('January 15, 2024');
  });

    it('should handle custom options', () => {
    const date = '2024-01-15T10:30:00Z';
    const result = formatDate(date, { year: '2-digit', month: '2-digit', day: '2-digit' });
    expect(result).toBe('01/15/24');
    });

  it('should handle different date formats', () => {
    expect(formatDate('2024-12-25')).toBe('December 25, 2024');
    expect(formatDate('2024-01-01')).toBe('January 1, 2024');
  });
});

describe('truncateText', () => {
  it('should return empty string for null or undefined', () => {
    expect(truncateText(null)).toBe('');
    expect(truncateText(undefined)).toBe('');
    expect(truncateText('')).toBe('');
  });

  it('should return the same text if shorter than maxLength', () => {
    const text = 'Short text';
    expect(truncateText(text, 20)).toBe('Short text');
  });

  it('should truncate text with ellipsis', () => {
    const text = 'This is a very long text that should be truncated';
    const result = truncateText(text, 20);
    expect(result).toBe('This is a very long...');
  });

  it('should truncate at word boundary', () => {
    const text = 'This is a very long text that should be truncated';
    const result = truncateText(text, 15);
    // The truncation should cut at the last space before 15
    expect(result).toMatch(/^This is/);
    expect(result).toContain('...');
  });

  it('should use default maxLength of 150', () => {
    const text = 'a'.repeat(200);
    const result = truncateText(text);
    expect(result).toHaveLength(153); // 150 chars + '...'
  });

  it('should handle custom maxLength', () => {
    const text = 'This is a long text with many words';
    const result = truncateText(text, 10);
    expect(result).toBe('This is a...');
  });
});