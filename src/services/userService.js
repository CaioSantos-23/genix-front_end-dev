import axios from 'axios';

const API_URL = process.env.VUE_APP_API_BASE_URL || 'http://localhost:8005/api'; 

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.warn('Token não encontrado no localStorage para userService.');
    return {};
  }
  return {
    'Authorization': `Bearer ${token}`,
    // 'Content-Type': 'application/json', // Axios define isso por padrão para dados de objeto
    // 'Accept': 'application/json' // Axios também define 'Accept' apropriadamente
  };
};

export const userService = {
  // Busca o perfil do usuário logado (o backend identifica pelo token)
  async getUserProfile() {
    try {
      // Adicionando log para verificar a URL
      console.log(`[userService] getUserProfile chamando: ${API_URL}/users/me`);
      const authHeaders = getAuthHeaders();
      if (!authHeaders.Authorization) { // Verifica se o token existe antes de chamar
        throw new Error('Usuário não autenticado - Token não encontrado para getUserProfile');
      }
      const response = await axios.get(`${API_URL}/users/me`, {
        headers: authHeaders
      });
      return response.data;
    } catch (error) {
      console.error('Erro em userService.getUserProfile:', error.response?.data || error.message, error);
      // Aqui você pode querer verificar error.response.status === 401 e deslogar o usuário
      // ex: if (error.response?.status === 401) { /* lógica de logout */ }
      throw error;
    }
  },

  // Atualiza nome, email, foto (opcional) do usuário logado
  async updateProfile({ name, email, photo }) {
    try {
      console.log(`[userService] updateProfile chamando: ${API_URL}/users/me`);
      const authHeaders = getAuthHeaders();
      if (!authHeaders.Authorization) {
        throw new Error('Usuário não autenticado - Token não encontrado para updateProfile');
      }
      const payload = { name, email };
      if (photo !== undefined) { // Inclui photo apenas se fornecido
          payload.photo = photo;
      }
      const response = await axios.patch(`${API_URL}/users/me`, payload, {
        headers: authHeaders
      });
      return response.data;
    } catch (error) {
      console.error('Erro em userService.updateProfile:', error.response?.data || error.message, error);
      throw error;
    }
  },

  // Upload de foto de perfil para o usuário logado
  // Esta função assume que photoData é uma URL ou base64. Para upload de arquivo, use FormData.
  async uploadProfilePhoto(photoData) {
    try {
      console.log(`[userService] uploadProfilePhoto chamando: ${API_URL}/users/me/photo`);
      const authHeaders = getAuthHeaders();
      if (!authHeaders.Authorization) {
        throw new Error('Usuário não autenticado - Token não encontrado para uploadProfilePhoto');
      }
      // Se photoData for um objeto File, você precisará usar FormData:
      // const formData = new FormData();
      // formData.append('profileImage', photoData); // 'profileImage' é o nome do campo esperado pelo backend
      // const response = await axios.patch(`${API_URL}/users/me/photo`, formData, {
      //   headers: { ...authHeaders, 'Content-Type': 'multipart/form-data' }
      // });

      // Se photoData é uma string (URL, base64)
      const response = await axios.patch(`${API_URL}/users/me/photo`, { photo: photoData }, {
        headers: authHeaders
      });
      return response.data.photo;
    } catch (error) {
      console.error('Erro em userService.uploadProfilePhoto:', error.response?.data || error.message, error);
      throw error;
    }
  },

  // Atualiza senha do usuário logado
  async updatePassword({ currentPassword, newPassword }) {
    try {
      console.log(`[userService] updatePassword chamando: ${API_URL}/users/me/password`);
      const authHeaders = getAuthHeaders();
      if (!authHeaders.Authorization) {
        throw new Error('Usuário não autenticado - Token não encontrado para updatePassword');
      }
      const response = await axios.put(`${API_URL}/users/me/password`, { currentPassword, newPassword }, {
        headers: authHeaders
      });
      return response.data;
    } catch (error) {
      console.error('Erro em userService.updatePassword:', error.response?.data || error.message, error);
      throw error;
    }
  },

  // Atualiza gêneros favoritos do usuário logado
  async updateGenres(genres) { // genres deve ser um array de strings ou IDs
    try {
      console.log(`[userService] updateGenres chamando: ${API_URL}/users/me/genres`);
      const authHeaders = getAuthHeaders();
      if (!authHeaders.Authorization) {
        throw new Error('Usuário não autenticado - Token não encontrado para updateGenres');
      }
      const response = await axios.put(`${API_URL}/users/me/genres`, { favoriteGenres: genres }, {
        headers: authHeaders
      });
      return response.data;
    } catch (error) {
      console.error('Erro em userService.updateGenres:', error.response?.data || error.message, error);
      throw error;
    }
  },

  // Busca gêneros favoritos
  async getFavoriteGenres() {
    try {
        console.log(`[userService] getFavoriteGenres chamando: ${API_URL}/users/me/genres`);
        const authHeaders = getAuthHeaders();
        if (!authHeaders.Authorization) {
          // Se não estiver autenticado, pode retornar array vazio ou lançar erro
          // dependendo da lógica da sua UI
          console.warn('[userService] getFavoriteGenres: Usuário não autenticado, retornando array vazio.');
          return [];
          // throw new Error('Usuário não autenticado - Token não encontrado para getFavoriteGenres');
        }
        const response = await axios.get(`${API_URL}/users/me/genres`, {
            headers: authHeaders
        });
        return response.data.favoriteGenres || [];
    } catch (error) {
        console.error('Erro ao buscar gêneros favoritos do backend:', error.response?.data || error.message, error);
        // Não é ideal fazer fallback para localStorage aqui se a chamada de API falha por outros motivos.
        // Melhor tratar o erro na UI ou lançá-lo.
        throw error;
        // const user = JSON.parse(localStorage.getItem('user'));
        // return user?.favoriteGenres || [];
    }
  },

  // Busca filmes favoritos do usuário
  async getFavoriteMovies() {
    try {
      console.log(`[userService] getFavoriteMovies chamando: ${API_URL}/users/me/favorite-movies`);
      const authHeaders = getAuthHeaders();
      if (!authHeaders.Authorization) {
        throw new Error('Usuário não autenticado - Token não encontrado para getFavoriteMovies');
      }
      const response = await axios.get(`${API_URL}/users/me/favorite-movies`, {
        headers: authHeaders
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar filmes favoritos:', error.response?.data?.message || error.message, error);
      throw new Error(error.response?.data?.message || 'Erro ao buscar filmes favoritos');
    }
  },

  // Adiciona filme aos favoritos
  async addFavoriteMovie(movieId) {
    try {
      console.log(`[userService] addFavoriteMovie chamando: ${API_URL}/users/me/favorite-movies`);
      const authHeaders = getAuthHeaders();
      if (!authHeaders.Authorization) {
        throw new Error('Usuário não autenticado - Token não encontrado para addFavoriteMovie');
      }
      const response = await axios.post(`${API_URL}/users/me/favorite-movies`, { movieId }, { // movieId deve ser o ID TMDB
        headers: authHeaders
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao adicionar filme aos favoritos:', error.response?.data?.message || error.message, error);
      throw new Error(error.response?.data?.message || 'Erro ao adicionar filme aos favoritos');
    }
  },

  // Remove filme dos favoritos
  async removeFavoriteMovie(movieId) { // movieId deve ser o ID TMDB
    try {
      console.log(`[userService] removeFavoriteMovie chamando: ${API_URL}/users/me/favorite-movies/${movieId}`);
      const authHeaders = getAuthHeaders();
      if (!authHeaders.Authorization) {
        throw new Error('Usuário não autenticado - Token não encontrado para removeFavoriteMovie');
      }
      const response = await axios.delete(`${API_URL}/users/me/favorite-movies/${movieId}`, {
        headers: authHeaders
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao remover filme dos favoritos:', error.response?.data?.message || error.message, error);
      throw new Error(error.response?.data?.message || 'Erro ao remover filme dos favoritos');
    }
  }
};