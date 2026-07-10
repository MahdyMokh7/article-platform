/**
 * Security Utilities
 * 
 * Token Storage Strategy:
 * 
 * Current Approach: localStorage
 * - Simple and widely used
 * - Persists across browser sessions
 * - XSS vulnerability: Scripts can access localStorage
 * 
 * Production Recommendation: httpOnly Cookies
 * - More secure (not accessible via JavaScript)
 * - Requires backend configuration (Set-Cookie header)
 * - CSRF protection needed
 * 
 * This project uses localStorage for simplicity with security awareness:
 * 1. Token is stored only after successful login
 * 2. Token is removed on logout
 * 3. 401 responses automatically clear the token
 * 4. Use HTTPS in production
 * 5. Consider adding Content Security Policy (CSP)
 */

export const tokenStorage = {
  getToken: () => localStorage.getItem('authToken'),
  setToken: (token) => localStorage.setItem('authToken', token),
  removeToken: () => localStorage.removeItem('authToken'),
  hasToken: () => !!localStorage.getItem('authToken'),
};

export const userStorage = {
  getUser: () => {
    const user = localStorage.getItem('authUser');
    return user ? JSON.parse(user) : null;
  },
  setUser: (user) => localStorage.setItem('authUser', JSON.stringify(user)),
  removeUser: () => localStorage.removeItem('authUser'),
};