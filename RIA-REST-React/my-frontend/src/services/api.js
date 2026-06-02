/**
 * API Service Layer for Article Platform
 *
 * This module handles all communication with the backend REST API.
 * Features:
 * - Centralized error handling
 * - Request/response interceptors
 * - Retry logic for failed requests
 * - Request cancellation support
 * - Automatic token refresh (prepared for future auth)
 * - Comprehensive logging (disabled in production)
 *
 * @module services/api
 */

import axios from 'axios';
import { toast } from 'react-toastify';


// ============================
// Configuration
// ============================
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

const REQUEST_TIMEOUT_MS = 30000;

// ============================
// Axios Instance Setup
// ============================
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  validateStatus: (status) => status >= 200 && status < 500,
});

// ============================
// Request Interceptor
// ============================
api.interceptors.request.use(
  (config) => {
    config.metadata = { startTime: Date.now() };

    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data,
      });
    }

    // You can add auth token here when needed:
    // const token = localStorage.getItem('authToken');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }

    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// ============================
// Response Interceptor
// ============================
api.interceptors.response.use(
  (response) => {
    // Log response time in development
    if (import.meta.env.DEV && response.config.metadata) {
      const duration = Date.now() - response.config.metadata.startTime;
      console.log(`[API Response] ${response.config.url} - ${duration}ms`);
    }
    return response;
  },
  async (error) => {
    const { config, response } = error;

    if (!response) {
      console.error('[Network Error]', error.message);
      toast.error('Cannot connect to server. Please check if backend is running.');
      return Promise.reject(new Error('Network Error: Unable to reach server'));
    }

    if (import.meta.env.DEV) {
      console.error('[API Error]', {
        url: config?.url,
        status: response.status,
        data: response.data,
      });
    }

    if (config && config.__retryCount === undefined) {
      config.__retryCount = 0;
    }

    const shouldRetry = (
      config &&
      config.__retryCount < MAX_RETRIES &&
      [408, 429, 500, 502, 503, 504].includes(response?.status)
    );

    if (shouldRetry) {
      config.__retryCount += 1;
      console.log(`[Retry ${config.__retryCount}/${MAX_RETRIES}] ${config.url}`);

      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * config.__retryCount));
      return api(config);
    }

    return Promise.reject(error);
  }
);

// ============================
// Error Handling Utilities
// ============================
export const getErrorMessage = (error) => {
  if (!error.response) {
    return 'Network error. Please check your connection.';
  }

  const { status, data } = error.response;

  switch (status) {
    case 400:
      return data?.message || 'Invalid request. Please check your input.';
    case 401:
      return 'Unauthorized. Please login again.';
    case 403:
      return 'Access denied. You don\'t have permission for this action.';
    case 404:
      return data?.message || 'Resource not found.';
    case 409:
      return data?.message || 'Conflict detected. The resource may already exist.';
    case 422:
      return data?.message || 'Validation failed. Please check your input.';
    case 429:
      return 'Too many requests. Please try again later.';
    case 500:
    case 502:
    case 503:
    case 504:
      return 'Server error. Please try again later.';
    default:
      return data?.message || 'An unexpected error occurred.';
  }
};

export const handleApiError = (error, showToast = true) => {
  const message = getErrorMessage(error);

  if (showToast) {
    toast.error(message);
  }

  return {
    success: false,
    message,
    status: error.response?.status,
    originalError: error,
  };
};

export const makeCancelable = (requestFn) => {
  const abortController = new AbortController();

  const promise = requestFn({ signal: abortController.signal });

  return {
    promise,
    cancel: () => abortController.abort(),
  };
};

// ============================
// Article API Calls
// ============================
export const getAllArticles = async () => {
  try {
    const response = await api.get('/articles');

    if (response.status === 200) {
      return response.data;
    }

    throw new Error(`Unexpected status code: ${response.status}`);
  } catch (error) {
    const handled = handleApiError(error, true);
    throw new Error(handled.message);
  }
};

export const searchArticles = async (searchTerm) => {
  if (!searchTerm || searchTerm.trim() === '') {
    return getAllArticles();
  }

  try {
    const response = await api.get('/articles/search', {
      params: { q: searchTerm.trim() },
    });

    if (response.status === 200) {
      return response.data;
    }

    throw new Error(`Unexpected status code: ${response.status}`);
  } catch (error) {
    const handled = handleApiError(error, true);
    throw new Error(handled.message);
  }
};

export const getArticleById = async (id) => {
  if (!id) {
    throw new Error('Article ID is required');
  }

  try {
    const response = await api.get(`/articles/${id}`);

    if (response.status === 200) {
      return response.data;
    }

    throw new Error(`Unexpected status code: ${response.status}`);
  } catch (error) {
    const handled = handleApiError(error, true);
    throw new Error(handled.message);
  }
};

export const createArticle = async (articleData) => {
  if (!articleData.title?.trim()) {
    throw new Error('Title is required');
  }

  if (!articleData.body?.trim()) {
    throw new Error('Body is required');
  }

  // Prepare data for backend
  const payload = {
    title: articleData.title.trim(),
    abstractText: articleData.abstractText?.trim() || '',
    body: articleData.body.trim(),
    referenceIds: articleData.referenceIds || [],
  };

  try {
    const response = await api.post('/articles', payload);

    if (response.status === 201 || response.status === 200) {
      return response.data;
    }

    throw new Error(`Unexpected status code: ${response.status}`);
  } catch (error) {
    const handled = handleApiError(error, true);
    throw new Error(handled.message);
  }
};


export const checkTitleAvailability = async (title) => {
  if (!title || title.trim() === '') {
    return true; // Empty title is not valid anyway, but we return true
  }

  try {
    const response = await api.get('/articles/check-title', {
      params: { title: title.trim() },
    });

    if (response.status === 200 && response.data) {
      return response.data.available === true;
    }

    return true; // Default to available if we can't determine
  } catch (error) {
    console.warn('[Title Check Failed]', error);
    return true; // Assume available on error (better UX)
  }
};

export const getPopularArticles = async () => {
  try {
    const response = await api.get('/articles/popular');

    if (response.status === 200) {
      return response.data;
    }

    throw new Error(`Unexpected status code: ${response.status}`);
  } catch (error) {
    const handled = handleApiError(error, true);
    throw new Error(handled.message);
  }
};

// ============================
// Batch Operations (Utility)
// ============================
export const getArticlesByIds = async (ids) => {
  if (!ids || ids.length === 0) {
    return [];
  }

  try {
    const allArticles = await getAllArticles();
    const idSet = new Set(ids.map(id => Number(id)));
    return allArticles.filter(article => idSet.has(article.id));
  } catch (error) {
    console.error('[Batch Fetch Failed]', error);
    return [];
  }
};

// ============================
// Export Default Instance
// ============================
export default api;