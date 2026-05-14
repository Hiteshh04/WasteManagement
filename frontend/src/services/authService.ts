import api from './api';

export const authService = {
  studentGoogleLogin: async (googleAccessToken: string, name: string, email: string) => {
    const response = await api.post('/auth/google/login', { 
      token: googleAccessToken, 
      name, 
      email 
    });
    return response.data;
  },

  supervisorLogin: async (username: string, password: string) => {
    const response = await api.post('/auth/supervisor/login', { username, password });
    return response.data;
  },

  logout: async (isSupervisor = false) => {
    const endpoint = isSupervisor ? '/supervisor/logout' : '/auth/logout';
    try {
      await api.post(endpoint);
    } catch (err) {
      console.error('Logout error', err);
    }
  }
};
