import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthService } from '../services/api.service';

// Create the context
const AuthContext = createContext();

// Create a provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Load user from localStorage on initial render
  useEffect(() => {
    const loadUser = async () => {
      try {
        // Check if the user is already logged in (has a token)
        const token = localStorage.getItem('access_token');
        if (token) {
          // Get the current user's data
          const response = await AuthService.getCurrentUser();
          setUser(response.data);
        }
      } catch (err) {
        console.error('Failed to load user:', err);
        // Clear invalid tokens
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);
  
  // Login function
  const login = async (username, password) => {
    try {
      setError(null);
      // Log in the user
      const tokenData = await AuthService.login(username, password);
      // Get the user data
      const userResponse = await AuthService.getCurrentUser();
      setUser(userResponse.data);
      return userResponse.data;
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
      throw err;
    }
  };
  
  // Register function
  const register = async (userData) => {
    try {
      setError(null);
      // Register the user
      await AuthService.register(userData);
      // Log in the user after registration
      return login(userData.username, userData.password);
    } catch (err) {
      setError(err.response?.data || 'Registration failed. Please try again.');
      throw err;
    }
  };
  
  // Logout function
  const logout = () => {
    AuthService.logout();
    setUser(null);
  };
  
  // Update user profile
  const updateProfile = async (userData) => {
    try {
      setError(null);
      const response = await AuthService.updateProfile(userData);
      setUser(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data || 'Failed to update profile. Please try again.');
      throw err;
    }
  };
  
  // Check if the user is authenticated
  const isAuthenticated = () => {
    return !!user;
  };
  
  // Check if the user has a specific role
  const hasRole = (role) => {
    return user && user.role === role;
  };
  
  // Context value
  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated,
    hasRole,
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};