/**
 * Article API Service
 *
 * Handles all article-related API calls with authentication support.
 * Public endpoints: GET operations (no auth required)
 * Protected endpoints: POST, PUT, DELETE (JWT required)
 *
 * @module services/articleApi
 */

import api from './axiosConfig';

// ============================
// Public Endpoints (No Auth Required)
// ============================

/**
 * Get all articles sorted by publication date (newest first)
 * @returns {Promise<Array>} List of articles
 */
export const getAllArticles = async () => {
  const response = await api.get('/articles');
  return response.data;
};

/**
 * Get a single article by ID
 * @param {number|string} id - Article ID
 * @returns {Promise<Object>} Article details
 */
export const getArticleById = async (id) => {
  if (!id) throw new Error('Article ID is required');
  const response = await api.get(`/articles/${id}`);
  return response.data;
};

/**
 * Search articles by title or abstract
 * @param {string} searchTerm - Search query
 * @returns {Promise<Array>} Matching articles
 */
export const searchArticles = async (searchTerm) => {
  if (!searchTerm?.trim()) return getAllArticles();
  const response = await api.get('/articles/search', {
    params: { q: searchTerm.trim() },
  });
  return response.data;
};

/**
 * Check if a title is available (not already used)
 * @param {string} title - Title to check
 * @returns {Promise<boolean>} True if available
 */
export const checkTitleAvailability = async (title) => {
  if (!title?.trim()) return true;
  try {
    const response = await api.get('/articles/check-title', {
      params: { title: title.trim() },
    });
    return response.data?.available === true;
  } catch {
    return true; // Assume available on error
  }
};

/**
 * Get articles sorted by citation count (most cited first)
 * @returns {Promise<Array>} Popular articles
 */
export const getPopularArticles = async () => {
  const response = await api.get('/articles/popular');
  return response.data;
};

// ============================
// Protected Endpoints (Auth Required)
// ============================

/**
 * Create a new article (requires JWT)
 * @param {Object} articleData - Article data
 * @param {string} articleData.title - Article title (required)
 * @param {string} articleData.abstractText - Article abstract (optional)
 * @param {string} articleData.body - Article body (required)
 * @param {number[]} articleData.referenceIds - Referenced article IDs (optional)
 * @returns {Promise<Object>} Created article
 */
export const createArticle = async (articleData) => {
  if (!articleData?.title?.trim()) throw new Error('Title is required');
  if (!articleData?.body?.trim()) throw new Error('Body is required');

  const payload = {
    title: articleData.title.trim(),
    abstractText: articleData.abstractText?.trim() || '',
    body: articleData.body.trim(),
    referenceIds: articleData.referenceIds || [],
  };

  const response = await api.post('/articles', payload);
  return response.data;
};

/**
 * Update an existing article (requires JWT, must be author)
 * @param {number|string} id - Article ID
 * @param {Object} articleData - Updated article data
 * @param {string} articleData.title - Article title (required)
 * @param {string} articleData.abstractText - Article abstract (optional)
 * @param {string} articleData.body - Article body (required)
 * @returns {Promise<Object>} Updated article
 */
export const updateArticle = async (id, articleData) => {
  if (!id) throw new Error('Article ID is required');
  if (!articleData?.title?.trim()) throw new Error('Title is required');
  if (!articleData?.body?.trim()) throw new Error('Body is required');

  const payload = {
    title: articleData.title.trim(),
    abstractText: articleData.abstractText?.trim() || '',
    body: articleData.body.trim(),
  };

  const response = await api.put(`/articles/${id}`, payload);
  return response.data;
};

/**
 * Delete an article (requires JWT, must be author)
 * @param {number|string} id - Article ID
 * @returns {Promise<void>}
 */
export const deleteArticle = async (id) => {
  if (!id) throw new Error('Article ID is required');
  await api.delete(`/articles/${id}`);
};

// ============================
// Batch Operations (Utility)
// ============================

/**
 * Get multiple articles by their IDs
 * @param {number[]} ids - Array of article IDs
 * @returns {Promise<Array>} Matching articles
 */
export const getArticlesByIds = async (ids) => {
  if (!ids?.length) return [];
  try {
    const allArticles = await getAllArticles();
    const idSet = new Set(ids.map(id => Number(id)));
    return allArticles.filter(article => idSet.has(article.id));
  } catch {
    return [];
  }
};

// ============================
// Export All
// ============================

export default {
  getAllArticles,
  getArticleById,
  searchArticles,
  checkTitleAvailability,
  getPopularArticles,
  createArticle,
  updateArticle,
  deleteArticle,
  getArticlesByIds,
};