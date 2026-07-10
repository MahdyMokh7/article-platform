import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import * as authApi from '../services/authApi';
import { getCurrentUser } from '../services/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('authUser');

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
          
          // Verify token is still valid by fetching profile
          const profile = await getCurrentUser();
          setUser(profile);
          localStorage.setItem('authUser', JSON.stringify(profile));
        } catch (error) {
          // Token is invalid or expired
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (credentials) => {
    setLoading(true);
    try {
      const response = await authApi.login(credentials);
      
      // Store token and user
      localStorage.setItem('authToken', response.accessToken);
      localStorage.setItem('authUser', JSON.stringify(response));
      
      setToken(response.accessToken);
      setUser(response);
      setIsAuthenticated(true);
      
      return { success: true, user: response };
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (userData) => {
    setLoading(true);
    try {
      const response = await authApi.register(userData);
      return { success: true, user: response };
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const updateProfile = useCallback(async (profileData) => {
    setLoading(true);
    try {
      const updatedUser = await authApi.updateProfile(profileData);
      setUser(updatedUser);
      localStorage.setItem('authUser', JSON.stringify(updatedUser));
      return { success: true, user: updatedUser };
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const changePassword = useCallback(async (passwordData) => {
    setLoading(true);
    try {
      await authApi.changePassword(passwordData);
      return { success: true };
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    user,
    token,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;