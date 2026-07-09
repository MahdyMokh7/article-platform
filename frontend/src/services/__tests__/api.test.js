import { describe, it, expect, vi, beforeEach } from 'vitest';

// ========== IMPORTANT: Mock axios FIRST ==========
vi.mock('axios', () => {
  const mockAxiosInstance = {
    get: vi.fn(),
    post: vi.fn(),
    interceptors: {
      request: { use: vi.fn(), eject: vi.fn() },
      response: { use: vi.fn(), eject: vi.fn() },
    },
  };

  return {
    default: {
      create: vi.fn(() => mockAxiosInstance),
      get: vi.fn(),
      post: vi.fn(),
    },
  };
});

// Now import axios and your API
import axios from 'axios';
import {
  getAllArticles,
  searchArticles,
  getArticleById,
  createArticle,
  checkTitleAvailability,
  getPopularArticles,
} from '../api';

const mockedAxios = axios;

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllArticles', () => {
    it('should fetch all articles successfully', async () => {
      const mockArticles = [{ id: 1, title: 'Test Article' }];
      
      // Get the mocked instance and mock its get method
      const mockInstance = mockedAxios.create();
      mockInstance.get.mockResolvedValue({ status: 200, data: mockArticles });

      const result = await getAllArticles();

      expect(mockInstance.get).toHaveBeenCalledWith('/articles');
      expect(result).toEqual(mockArticles);
    });

    it('should handle errors', async () => {
      const mockInstance = mockedAxios.create();
      mockInstance.get.mockRejectedValue(new Error('Network error'));

      await expect(getAllArticles()).rejects.toThrow();
    });
  });

  describe('searchArticles', () => {
    it('should search with term', async () => {
      const mockResults = [{ id: 1, title: 'React Article' }];
      const mockInstance = mockedAxios.create();
      mockInstance.get.mockResolvedValue({ status: 200, data: mockResults });

      const result = await searchArticles('React');

      expect(mockInstance.get).toHaveBeenCalledWith('/articles/search', {
        params: { q: 'React' },
      });
      expect(result).toEqual(mockResults);
    });

    it('should return all articles when search term is empty', async () => {
      const mockArticles = [{ id: 1, title: 'Article' }];
      const mockInstance = mockedAxios.create();
      mockInstance.get.mockResolvedValue({ status: 200, data: mockArticles });

      const result = await searchArticles('');

      expect(mockInstance.get).toHaveBeenCalledWith('/articles');
      expect(result).toEqual(mockArticles);
    });
  });

  describe('getArticleById', () => {
    it('should fetch article by ID', async () => {
      const mockArticle = { id: 1, title: 'Test', body: 'Content' };
      const mockInstance = mockedAxios.create();
      mockInstance.get.mockResolvedValue({ status: 200, data: mockArticle });

      const result = await getArticleById(1);

      expect(mockInstance.get).toHaveBeenCalledWith('/articles/1');
      expect(result).toEqual(mockArticle);
    });

    it('should throw error if ID missing', async () => {
      await expect(getArticleById()).rejects.toThrow('Article ID is required');
    });
  });

  describe('createArticle', () => {
    const validArticle = {
      title: 'New Article',
      abstractText: 'Abstract',
      body: 'Body content',
      referenceIds: [],
    };

    it('should create article successfully', async () => {
      const createdArticle = { id: 5, ...validArticle };
      const mockInstance = mockedAxios.create();
      mockInstance.post.mockResolvedValue({ status: 201, data: createdArticle });

      const result = await createArticle(validArticle);

      expect(mockInstance.post).toHaveBeenCalledWith('/articles', {
        title: 'New Article',
        abstractText: 'Abstract',
        body: 'Body content',
        referenceIds: [],
      });
      expect(result).toEqual(createdArticle);
    });

    it('should throw error if title missing', async () => {
      await expect(createArticle({ body: 'Content' })).rejects.toThrow('Title is required');
    });

    it('should throw error if body missing', async () => {
      await expect(createArticle({ title: 'Title' })).rejects.toThrow('Body is required');
    });
  });

  describe('checkTitleAvailability', () => {
    it('should return true for available title', async () => {
      const mockInstance = mockedAxios.create();
      mockInstance.get.mockResolvedValue({ status: 200, data: { available: true } });

      const result = await checkTitleAvailability('New Title');

      expect(result).toBe(true);
    });

    it('should return false for taken title', async () => {
      const mockInstance = mockedAxios.create();
      mockInstance.get.mockResolvedValue({ status: 200, data: { available: false } });

      const result = await checkTitleAvailability('Existing Title');

      expect(result).toBe(false);
    });
  });

  describe('getPopularArticles', () => {
    it('should fetch popular articles', async () => {
      const popularArticles = [{ id: 1, title: 'Popular', citationCount: 10 }];
      const mockInstance = mockedAxios.create();
      mockInstance.get.mockResolvedValue({ status: 200, data: popularArticles });

      const result = await getPopularArticles();

      expect(mockInstance.get).toHaveBeenCalledWith('/articles/popular');
      expect(result).toEqual(popularArticles);
    });
  });
});