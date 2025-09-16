import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure base URL - Update this to match your Laravel backend URL
// Use localhost for development - more secure than exposing IP
const BASE_URL = 'http://127.0.0.1:8000/api';

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Request interceptor for auth token
    this.api.interceptors.request.use(
      (config) => {
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => {
        console.log('✅ API Response interceptor - Success:', response.status, response.data);
        return response;
      },
      (error) => {
        console.error('❌ API Response interceptor - Error:', error.response?.status, error.response?.data);
        console.error('❌ Network error details:', error.message);
        return Promise.reject(error);
      }
    );
  }

  setAuthToken(token) {
    this.authToken = token;
  }

  // Authentication methods
  async login(email, password) {
    console.log('🔐 Attempting login for:', email);
    try {
      const response = await this.api.post('/login', { email, password });
      console.log('✅ Login success - Full response:', response.data);
      return response.data;
    } catch (error) {
      console.log('❌ Login error - Status:', error.response?.status);
      console.log('❌ Login error - Data:', error.response?.data);
      if (error.response?.data) {
        return error.response.data;
      }
      throw error;
    }
  }

  async register(userData) {
    console.log('🚀 Sending registration data:', userData);
    try {
      const response = await this.api.post('/register', userData);
      console.log('✅ Registration success - Full response:', response.data);
      return response.data;
    } catch (error) {
      console.log('❌ Registration error - Status:', error.response?.status);
      console.log('❌ Registration error - Full response:', error.response?.data);
      console.log('❌ Registration error - Headers:', error.response?.headers);
      if (error.response?.data) {
        return error.response.data;
      }
      throw error;
    }
  }

  async logout() {
    try {
      const response = await this.api.post('/logout');
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        return error.response.data;
      }
      throw error;
    }
  }

  async getProfile() {
    try {
      const response = await this.api.get('/profile');
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        return error.response.data;
      }
      throw error;
    }
  }

  async updateProfile(profileData) {
    try {
      const response = await this.api.put('/profile', profileData);
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        return error.response.data;
      }
      throw error;
    }
  }

  // Conversation methods
  async getConversations() {
    try {
      const response = await this.api.get('/conversations');
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        return error.response.data;
      }
      throw error;
    }
  }

  async createConversation(conversationData) {
    try {
      const response = await this.api.post('/conversations', conversationData);
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        return error.response.data;
      }
      throw error;
    }
  }

  async getConversation(conversationId) {
    try {
      const response = await this.api.get(`/conversations/${conversationId}`);
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        return error.response.data;
      }
      throw error;
    }
  }

  async sendMessage(conversationId, message) {
    try {
      const response = await this.api.post(`/conversations/${conversationId}/messages`, { message });
      return response.data;
    } catch (error) {
      if (error.response?.data) {
        return error.response.data;
      }
      throw error;
    }
  }

  async deleteConversation(id) {
    try {
      console.log('🗑️ API: Deleting conversation with ID:', id);
      const response = await this.api.delete(`/conversations/${id}`);
      console.log('✅ API: Delete conversation response:', response.data);
      
      if (response.data && response.data.success) {
        console.log('✅ API: Conversation deletion confirmed successful');
        return response.data;
      } else {
        console.log('❌ API: Conversation deletion failed - no success flag');
        throw new Error('Deletion failed - no success confirmation');
      }
    } catch (error) {
      console.error('❌ API: Delete conversation error:', error);
      if (error.response?.data) {
        console.log('❌ API: Error response data:', error.response.data);
        return { success: false, message: error.response.data.message || 'Error deleting conversation' };
      }
      return { success: false, message: 'Network error deleting conversation' };
    }
  }

  // Diary methods
  async getDiaryEntries() {
    return await this.api.get('/diary-entries');
  }

  async createDiaryEntry(entryData) {
    return await this.api.post('/diary-entries', entryData);
  }

  async getDiaryEntry(id) {
    return await this.api.get(`/diary-entries/${id}`);
  }

  async updateDiaryEntry(id, entryData) {
    return await this.api.put(`/diary-entries/${id}`, entryData);
  }

  async deleteDiaryEntry(id) {
    return await this.api.delete(`/diary-entries/${id}`);
  }

  async getDiaryByDateRange(startDate, endDate) {
    return await this.api.get('/diary/date-range', {
      params: { start_date: startDate, end_date: endDate }
    });
  }

  async getMoodStats() {
    return await this.api.get('/diary/mood-stats');
  }

  // Wellness methods
  async getWellnessRoutines() {
    return await this.api.get('/wellness-routines');
  }

  async getWellnessRecommendations() {
    return await this.api.get('/wellness/recommendations');
  }

  async getWellnessRoutine(id) {
    return await this.api.get(`/wellness-routines/${id}`);
  }

  async createWellnessRoutine(routineData) {
    return await this.api.post('/wellness-routines', routineData);
  }

  async completeRoutine(routineId, completionData) {
    return await this.api.post(`/wellness-routines/${routineId}/complete`, completionData);
  }

  async getCompletionHistory() {
    return await this.api.get('/wellness/completion-history');
  }

  // Voice transcription
  async transcribeAudio(formData) {
    try {
      console.log('🎤 API: Sending audio for transcription...');
      const response = await this.api.post('/transcribe-audio', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 seconds timeout for audio processing
      });
      console.log('✅ API: Audio transcription successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ API: Error transcribing audio:', error);
      throw error;
    }
  }

  // Health check
  async healthCheck() {
    return await this.api.get('/health');
  }
}

const apiService = new ApiService();
export default apiService;
