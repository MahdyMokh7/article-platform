/**
 * Article API Service Tests
 *
 * Tests for article API functions (GET, POST, PUT, DELETE)
 *
 * @module services/__tests__/articleApi.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ========== IMPORTANT: Mock axios FIRST ==========
vi.mock('../axiosConfig', () => {
  const mockApi = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn(), eject: vi.fn() },
      response: { use: vi.fn(), eject: vi.fn() },
    },
  };

  return {
    default: mockApi,
  };
});

import api from '../axiosConfig';
import {
  getAllArticles,
  searchArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  checkTitleAvailability,
  getPopularArticles,
  getArticlesByIds,
} from '../articleApi';

describe('Article API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllArticles', () => {
    it('should fetch all articles successfully', async () => {
      const mockArticles = [
        { id: 1, title: 'Test Article 1' },
        { id: 2, title: 'Test Article 2' },
      ];

      api.get.mockResolvedValue({ data: mockArticles });

      const result = await getAllArticles();

      expect(api.get).toHaveBeenCalledWith('/articles');
      expect(result).toEqual(mockArticles);
    });

    it('should handle errors when fetching articles', async () => {
      const error = new Error('Network error');
      api.get.mockRejectedValue(error);

      await expect(getAllArticles()).rejects.toThrow('Network error');
    });
  });

  describe('searchArticles', () => {
    it('should search with term', async () => {
      const mockResults = [{ id: 1, title: 'React Article' }];
      api.get.mockResolvedValue({ data: mockResults });

      const result = await searchArticles('React');

      expect(api.get).toHaveBeenCalledWith('/articles/search', {
        params: { q: 'React' },
      });
      expect(result).toEqual(mockResults);
    });

    it('should return all articles when search term is empty', async () => {
      const mockArticles = [{ id: 1, title: 'Article' }];
      api.get.mockResolvedValue({ data: mockArticles });

      const result = await searchArticles('');

      expect(api.get).toHaveBeenCalledWith('/articles');
      expect(result).toEqual(mockArticles);
    });

    it('should return all articles when search term is whitespace', async () => {
      const mockArticles = [{ id: 1, title: 'Article' }];
      api.get.mockResolvedValue({ data: mockArticles });

      const result = await searchArticles('   ');

      expect(api.get).toHaveBeenCalledWith('/articles');
      expect(result).toEqual(mockArticles);
    });
  });

  describe('getArticleById', () => {
    it('should fetch article by ID', async () => {
      const mockArticle = { id: 1, title: 'Test', body: 'Content' };
      api.get.mockResolvedValue({ data: mockArticle });

      const result = await getArticleById(1);

      expect(api.get).toHaveBeenCalledWith('/articles/1');
      expect(result).toEqual(mockArticle);
    });

    it('should throw error if ID is missing', async () => {
      await expect(getArticleById()).rejects.toThrow('Article ID is required');
    });

    it('should throw error if ID is null', async () => {
      await expect(getArticleById(null)).rejects.toThrow('Article ID is required');
    });

    it('should throw error if ID is empty string', async () => {
      await expect(getArticleById('')).rejects.toThrow('Article ID is required');
    });
  });

  describe('createArticle', () => {
    const validArticle = {
      title: 'New Article',
      abstractText: 'Abstract',
      body: 'Body content',
      referenceIds: [1, 2],
    };

    it('should create article successfully', async () => {
      const createdArticle = { id: 5, ...validArticle };
      api.post.mockResolvedValue({ data: createdArticle });

      const result = await createArticle(validArticle);

      expect(api.post).toHaveBeenCalledWith('/articles', {
        title: 'New Article',
        abstractText: 'Abstract',
        body: 'Body content',
        referenceIds: [1, 2],
      });
      expect(result).toEqual(createdArticle);
    });

    it('should create article without optional fields', async () => {
      const minimalArticle = {
        title: 'Minimal Article',
        body: 'Body only',
      };
      const createdArticle = { id: 6, ...minimalArticle, abstractText: '', referenceIds: [] };
      api.post.mockResolvedValue({ data: createdArticle });

      const result = await createArticle(minimalArticle);

      expect(api.post).toHaveBeenCalledWith('/articles', {
        title: 'Minimal Article',
        abstractText: '',
        body: 'Body only',
        referenceIds: [],
      });
      expect(result).toEqual(createdArticle);
    });

    it('should throw error if title is missing', async () => {
      await expect(createArticle({ body: 'Content' })).rejects.toThrow('Title is required');
    });

    it('should throw error if title is empty string', async () => {
      await expect(createArticle({ title: '', body: 'Content' })).rejects.toThrow('Title is required');
    });

    it('should throw error if body is missing', async () => {
      await expect(createArticle({ title: 'Title' })).rejects.toThrow('Body is required');
    });

    it('should throw error if body is empty string', async () => {
      await expect(createArticle({ title: 'Title', body: '' })).rejects.toThrow('Body is required');
    });
  });

  describe('updateArticle', () => {
    const validUpdate = {
      title: 'Updated Title',
      abstractText: 'Updated Abstract',
      body: 'Updated Body',
    };

    it('should update article successfully', async () => {
      const updatedArticle = { id: 1, ...validUpdate };
      api.put.mockResolvedValue({ data: updatedArticle });

      const result = await updateArticle(1, validUpdate);

      expect(api.put).toHaveBeenCalledWith('/articles/1', validUpdate);
      expect(result).toEqual(updatedArticle);
    });

    it('should throw error if ID is missing', async () => {
      await expect(updateArticle(null, validUpdate)).rejects.toThrow('Article ID is required');
    });

    it('should throw error if title is missing', async () => {
      await expect(updateArticle(1, { body: 'Content' })).rejects.toThrow('Title is required');
    });

    it('should throw error if body is missing', async () => {
      await expect(updateArticle(1, { title: 'Title' })).rejects.toThrow('Body is required');
    });
  });

  describe('deleteArticle', () => {
    it('should delete article successfully', async () => {
      api.delete.mockResolvedValue({ data: null, status: 204 });

      await deleteArticle(1);

      expect(api.delete).toHaveBeenCalledWith('/articles/1');
    });

    it('should throw error if ID is missing', async () => {
      await expect(deleteArticle()).rejects.toThrow('Article ID is required');
    });

    it('should throw error if ID is null', async () => {
      await expect(deleteArticle(null)).rejects.toThrow('Article ID is required');
    });
  });

  describe('checkTitleAvailability', () => {
    it('should return true for available title', async () => {
      api.get.mockResolvedValue({ data: { available: true } });

      const result = await checkTitleAvailability('New Title');

      expect(api.get).toHaveBeenCalledWith('/articles/check-title', {
        params: { title: 'New Title' },
      });
      expect(result).toBe(true);
    });

    it('should return false for taken title', async () => {
      api.get.mockResolvedValue({ data: { available: false } });

      const result = await checkTitleAvailability('Existing Title');

      expect(result).toBe(false);
    });

    it('should return true for empty title', async () => {
      const result = await checkTitleAvailability('');

      expect(api.get).not.toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return true when API fails', async () => {
      api.get.mockRejectedValue(new Error('Network error'));

      const result = await checkTitleAvailability('Some Title');

      expect(result).toBe(true);
    });
  });

  describe('getPopularArticles', () => {
    it('should fetch popular articles', async () => {
      const popularArticles = [
        { id: 1, title: 'Popular', citationCount: 10 },
        { id: 2, title: 'More Popular', citationCount: 5 },
      ];
      api.get.mockResolvedValue({ data: popularArticles });

      const result = await getPopularArticles();

      expect(api.get).toHaveBeenCalledWith('/articles/popular');
      expect(result).toEqual(popularArticles);
    });

    it('should handle errors when fetching popular articles', async () => {
      const error = new Error('Network error');
      api.get.mockRejectedValue(error);

      await expect(getPopularArticles()).rejects.toThrow('Network error');
    });
  });

  describe('getArticlesByIds', () => {
    it('should fetch articles by IDs', async () => {
      const allArticles = [
        { id: 1, title: 'Article 1' },
        { id: 2, title: 'Article 2' },
        { id: 3, title: 'Article 3' },
      ];
      api.get.mockResolvedValue({ data: allArticles });

      const result = await getArticlesByIds([1, 3]);

      expect(api.get).toHaveBeenCalledWith('/articles');
      expect(result).toEqual([
        { id: 1, title: 'Article 1' },
        { id: 3, title: 'Article 3' },
      ]);
    });

    it('should return empty array for empty IDs', async () => {
      const result = await getArticlesByIds([]);

      expect(api.get).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should return empty array for null IDs', async () => {
      const result = await getArticlesByIds(null);

      expect(api.get).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should handle errors gracefully', async () => {
      api.get.mockRejectedValue(new Error('Network error'));

      const result = await getArticlesByIds([1, 2]);

      expect(result).toEqual([]);
    });
  });
});