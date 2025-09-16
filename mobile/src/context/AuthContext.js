import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from '../services/apiService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        apiService.setAuthToken(token);
        const response = await apiService.getProfile();
        if (response.success) {
          setUser(response.data.user);
        } else {
          await AsyncStorage.removeItem('authToken');
        }
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
      await AsyncStorage.removeItem('authToken');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    console.log('AuthContext - Starting login process for:', email);
    try {
      if (!apiService || typeof apiService.login !== 'function') {
        console.error('ApiService not available or login method missing');
        return { 
          success: false, 
          message: 'Error de configuración del servicio' 
        };
      }

      const response = await apiService.login(email, password);
      console.log('AuthContext - Login response:', response);
      
      if (response && response.success) {
        const { user, token } = response.data || {};
        if (user && token) {
          await AsyncStorage.setItem('authToken', token);
          apiService.setAuthToken(token);
          setUser(user);
          return { success: true };
        } else {
          console.error('Missing user or token in response:', response);
          return { success: false, message: 'Respuesta del servidor incompleta' };
        }
      } else {
        return { success: false, message: response?.message || 'Error de autenticación' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: 'Error de conexión. Por favor, intenta de nuevo.' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await apiService.register(userData);
      console.log('📋 AuthContext - Full response:', response);
      
      if (response.success) {
        const { user, token } = response;
        await AsyncStorage.setItem('authToken', token);
        apiService.setAuthToken(token);
        setUser(user);
        return { success: true };
      } else {
        console.log('❌ AuthContext - Validation errors:', response.errors);
        if (response.errors && response.errors.email) {
          console.log('📧 Email validation error:', response.errors.email);
        }
        return { success: false, message: response.message, errors: response.errors };
      }
    } catch (error) {
      console.error('💥 Register error:', error);
      return { 
        success: false, 
        message: 'Error de conexión. Por favor, intenta de nuevo.' 
      };
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await AsyncStorage.removeItem('authToken');
      apiService.setAuthToken(null);
      setUser(null);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await apiService.updateProfile(profileData);
      if (response.success) {
        setUser(response.data.user);
        return { success: true };
      } else {
        return { success: false, message: response.message, errors: response.errors };
      }
    } catch (error) {
      console.error('Update profile error:', error);
      return { 
        success: false, 
        message: 'Error de conexión. Por favor, intenta de nuevo.' 
      };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
