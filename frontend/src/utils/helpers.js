/**
 * Helper Utilities
 *
 * Reusable utility functions for the application.
 */

/**
 * Check if the current user is the author of an article
 * @param {Object} article - Article object
 * @param {Object} user - Current user object
 * @returns {boolean} True if user is the author
 */
export const isArticleAuthor = (article, user) => {
  if (!article || !user) return false;
  return article.authorId === user.id || article.author?.id === user.id;
};

/**
 * Check if a user is authenticated
 * @param {Object} user - Current user object
 * @returns {boolean} True if user is authenticated
 */
export const isAuthenticated = (user) => {
  return !!user?.id;
};

/**
 * Get user initials from username
 * @param {string} username - User's username
 * @returns {string} Initials (max 2 characters)
 */
export const getUserInitials = (username) => {
  if (!username) return 'U';
  return username.charAt(0).toUpperCase();
};

/**
 * Format date to readable string
 * @param {string} dateString - ISO date string
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date
 */
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return 'Date unknown';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options,
    }).format(date);
  } catch {
    return 'Date unknown';
  }
};

/**
 * Truncate text to a maximum length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 150) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  const truncated = text.substring(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(' ');
  if (lastSpaceIndex > 0) {
    return truncated.substring(0, lastSpaceIndex) + '...';
  }
  return truncated + '...';
};