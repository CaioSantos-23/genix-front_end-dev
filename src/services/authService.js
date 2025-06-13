import axios from 'axios'; 


const API_URL = process.env.VUE_APP_API_BASE_URL || 'http://localhost:8005/api'; // Fallback para localhost se não definida

export const authService = {
  async login(email, password) {
    console.log(`[authService] Tentando login para: ${API_URL}/auth/login`); // Log para ver a URL
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });

      if (response.data && response.data.token) {
        
        return { success: true, user: response.data.user, token: response.data.token };
      }
      return { success: false, message: response.data.message || 'Falha no login (authService).' };
    } catch (error) {
      console.error('Erro no login (authService):', error.response?.data || error.message);
      return { success: false, message: error.response?.data?.message || 'Erro durante o login.' };
    }
  },

  async register(userData) { 
    console.log(`[authService] Tentando registro para: ${API_URL}/auth/register`); 
    try {
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      return {
        success: true,
        message: response.data.message || 'Registro bem-sucedido!',
        user: response.data.user
      };
    } catch (error) {
      console.error('Erro no registro (authService):', error.response?.data || error.message);
      return { success: false, message: error.response?.data?.message || 'Erro durante o registro.' };
    }
  }
};