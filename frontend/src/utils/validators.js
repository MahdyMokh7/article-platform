/**
 * Form Validation Utilities
 *
 * Centralized validation functions for all forms in the application.
 * Each validator returns an error message string or null if valid.
 *
 * @module utils/validators
 */

// ============================
// Regex Patterns
// ============================

const PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[0-9]{10,15}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
  username: /^[a-zA-Z0-9_]{3,50}$/,
};

// ============================
// Validation Functions
// ============================

/**
 * Validate username
 * @param {string} value - Username to validate
 * @returns {string|null} Error message or null if valid
 */
export const validateUsername = (value) => {
  if (!value || value.trim() === '') {
    return 'Username is required';
  }
  if (value.length < 3) {
    return 'Username must be at least 3 characters';
  }
  if (value.length > 50) {
    return 'Username must be less than 50 characters';
  }
  if (!PATTERNS.username.test(value)) {
    return 'Username can only contain letters, numbers, and underscores';
  }
  return null;
};

/**
 * Validate email
 * @param {string} value - Email to validate
 * @returns {string|null} Error message or null if valid
 */
export const validateEmail = (value) => {
  if (!value || value.trim() === '') {
    return 'Email is required';
  }
  if (!PATTERNS.email.test(value)) {
    return 'Invalid email format';
  }
  return null;
};

/**
 * Validate phone number
 * @param {string} value - Phone to validate
 * @returns {string|null} Error message or null if valid
 */
export const validatePhone = (value) => {
  if (!value || value.trim() === '') {
    return null; // Phone is optional
  }
  if (!PATTERNS.phone.test(value)) {
    return 'Invalid phone format (e.g., +989123456789)';
  }
  return null;
};

/**
 * Validate password
 * @param {string} value - Password to validate
 * @returns {string|null} Error message or null if valid
 */
export const validatePassword = (value) => {
  if (!value) {
    return 'Password is required';
  }
  if (value.length < 6) {
    return 'Password must be at least 6 characters';
  }
  if (!/[a-z]/.test(value)) {
    return 'Must contain a lowercase letter';
  }
  if (!/[A-Z]/.test(value)) {
    return 'Must contain an uppercase letter';
  }
  if (!/\d/.test(value)) {
    return 'Must contain a number';
  }
  return null;
};

/**
 * Validate password confirmation
 * @param {string} password - Original password
 * @param {string} confirmPassword - Confirmation password
 * @returns {string|null} Error message or null if valid
 */
export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) {
    return 'Please confirm your password';
  }
  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }
  return null;
};

/**
 * Validate login credentials
 * @param {Object} data - Login form data
 * @param {string} data.username - Username
 * @param {string} data.password - Password
 * @returns {Object} Validation errors object
 */
export const validateLogin = (data) => {
  const errors = {};
  
  const usernameError = validateUsername(data.username);
  if (usernameError) errors.username = usernameError;
  
  const passwordError = validatePassword(data.password);
  if (passwordError) errors.password = passwordError;
  
  return errors;
};

/**
 * Validate registration form
 * @param {Object} data - Registration form data
 * @param {string} data.username - Username
 * @param {string} data.email - Email
 * @param {string} data.phone - Phone (optional)
 * @param {string} data.password - Password
 * @param {string} data.confirmPassword - Confirmation password
 * @returns {Object} Validation errors object
 */
export const validateRegistration = (data) => {
  const errors = {};
  
  const usernameError = validateUsername(data.username);
  if (usernameError) errors.username = usernameError;
  
  const emailError = validateEmail(data.email);
  if (emailError) errors.email = emailError;
  
  const phoneError = validatePhone(data.phone);
  if (phoneError) errors.phone = phoneError;
  
  const passwordError = validatePassword(data.password);
  if (passwordError) errors.password = passwordError;
  
  const confirmError = validateConfirmPassword(data.password, data.confirmPassword);
  if (confirmError) errors.confirmPassword = confirmError;
  
  return errors;
};

/**
 * Validate profile update form
 * @param {Object} data - Profile form data
 * @param {string} data.email - Email
 * @param {string} data.phone - Phone (optional)
 * @returns {Object} Validation errors object
 */
export const validateProfile = (data) => {
  const errors = {};
  
  const emailError = validateEmail(data.email);
  if (emailError) errors.email = emailError;
  
  const phoneError = validatePhone(data.phone);
  if (phoneError) errors.phone = phoneError;
  
  return errors;
};

/**
 * Validate password change form
 * @param {Object} data - Password change form data
 * @param {string} data.currentPassword - Current password
 * @param {string} data.newPassword - New password
 * @param {string} data.confirmPassword - Confirmation password
 * @returns {Object} Validation errors object
 */
export const validatePasswordChange = (data) => {
  const errors = {};
  
  if (!data.currentPassword) {
    errors.currentPassword = 'Current password is required';
  }
  
  const passwordError = validatePassword(data.newPassword);
  if (passwordError) errors.newPassword = passwordError;
  
  const confirmError = validateConfirmPassword(data.newPassword, data.confirmPassword);
  if (confirmError) errors.confirmPassword = confirmError;
  
  return errors;
};

// ============================
// Export All
// ============================

export default {
  validateUsername,
  validateEmail,
  validatePhone,
  validatePassword,
  validateConfirmPassword,
  validateLogin,
  validateRegistration,
  validateProfile,
  validatePasswordChange,
};