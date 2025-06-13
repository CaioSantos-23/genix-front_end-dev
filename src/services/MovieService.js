import axios from 'axios';

const CORRECT_API_BASE_URL = process.env.VUE_APP_API_BASE_URL || 'http://localhost:8005/api';

class MovieService {
    constructor() {
        this.api = axios.create({
            baseURL: CORRECT_API_BASE_URL,
        });

        this.api.interceptors.request.use(config => {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers['Authorization'] = `Bearer ${token}`;
            }
            config.headers['Content-Type'] = 'application/json';
            config.headers['Accept'] = 'application/json';
            return config;
        }, error => {
            return Promise.reject(error);
        });

        this.mockMovies = [ /* ... */ ];
    }

    // Get featured movie
    async getFeaturedMovie() {
        try {
            console.log(`[MovieService] Buscando filme em destaque do backend em: ${this.api.defaults.baseURL}/movies/popular?page=1`);
            const response = await this.api.get('/movies/popular', { params: { page: 1 } });
            if (response.data && response.data.results && response.data.results.length > 0) { // TMDB geralmente retorna em 'results'
                return response.data.results[0];
            } else if (response.data && response.data.length > 0) { // Se seu backend já trata e retorna array direto
                return response.data[0];
            }
            console.warn('[MovieService] Nenhum filme em destaque encontrado ou formato de resposta inesperado.');
            return null; // Ou lançar erro
        } catch (error) {
            console.error('Erro ao obter filme em destaque do backend:', error.response?.data || error.message || error);
            throw error;
        }
    }

    // Get trending movies
    async getTrendingMovies() {
        try {
            console.log(`[MovieService] Buscando filmes em tendência do backend em: ${this.api.defaults.baseURL}/movies/trending`);
            const response = await this.api.get('/movies/trending');
            return response.data;
        } catch (error) {
            console.error('Erro ao obter filmes em tendência do backend:', error.response?.data || error.message || error);
            throw error;
        }
    }

    // Get recommended movies
 async getRecommendedMovies() {
        try {
            console.log(`[MovieService] Buscando filmes recomendados (populares) do backend em: ${this.api.defaults.baseURL}/movies/popular?page=2`);
            const response = await this.api.get('/movies/popular', { params: { page: 2 } });
            return response.data;
        } catch (error) {
            console.error('Erro ao obter filmes recomendados do backend:', error.response?.data || error.message || error);
            throw error;
        }
    }

    async getNewReleases() {
        try {
            console.log(`[MovieService] Buscando lançamentos do backend em: ${this.api.defaults.baseURL}/movies/now-playing`);
            const response = await this.api.get('/movies/now-playing');
            return response.data;
        } catch (error) {
            console.error('Erro ao obter lançamentos do backend:', error.response?.data || error.message || error);
            throw error;
        }
    }

    async getTopRatedMovies() {
        try {
            console.log(`[MovieService] Buscando filmes mais bem avaliados do backend em: ${this.api.defaults.baseURL}/movies/top-rated`);
            const response = await this.api.get('/movies/top-rated');
            return response.data;
        } catch (error) {
            console.error('Erro ao obter filmes mais bem avaliados do backend:', error.response?.data || error.message || error);
            throw error;
        }
    }

    async searchMovies(query) {
        try {
            console.log(`[MovieService] Buscando filmes com query: "${query}" em: ${this.api.defaults.baseURL}/movies/search`);
            const response = await this.api.get('/movies/search', { params: { query } });
            return response.data;
        } catch (error) {
            console.error(`Erro ao buscar filmes com query "${query}":`, error.response?.data || error.message || error);
            throw error;
        }
    }

    async getMovieDetails(apiMovieId) {
        try {
            console.log(`[MovieService] Buscando detalhes para apiMovieId: ${apiMovieId} em ${this.api.defaults.baseURL}/movies/${apiMovieId}/details`);
            const response = await this.api.get(`/movies/${apiMovieId}/details`);
            console.log("[MovieService] Detalhes do filme recebidos:", response.data);
            return response.data;
        } catch (error) {
            console.error(`Erro ao obter detalhes do filme ${apiMovieId}:`, error.response?.data || error.message || error);
            throw error.response?.data || new Error(error.message || `Erro ao buscar detalhes do filme ${apiMovieId}.`);
        }
    }

    async getMoviesByGenre(genreNameOrId) {
        try {
            console.log(`[MovieService] Buscando filmes por gênero: ${genreNameOrId} em ${this.api.defaults.baseURL}/movies/genre/${genreNameOrId}`);
            const response = await this.api.get(`/movies/genre/${genreNameOrId}`);
            return response.data;
        } catch (error) {
            console.error(`Erro ao buscar filmes por gênero ${genreNameOrId}:`, error.response?.data || error.message || error);
            throw error;
        }
    }


    async addToWatchlist(tmdbMovieId) { // Renomeado parâmetro para clareza
        try {
            // Log ajustado para refletir que está adicionando a "favoritos" se for o caso
            console.log(`[MovieService] Adicionando filme ${tmdbMovieId} à lista (usando endpoint de favoritos)`);
            // Chama a rota de adicionar favorito.
            // O backend POST /users/me/favorite-movies espera { movieId } no seu código userRoutes.js
            // Mas addFavoriteMovie envia { apiMovieId }. Vamos padronizar para apiMovieId.
            const response = await this.api.post(`/users/me/favorite-movies`, { apiMovieId: tmdbMovieId.toString() });
            return response.data;
        } catch (error) {
            console.error('Erro ao adicionar filme à lista (via favoritos):', error.response?.data || error.message || error);
            throw error;
        }
    }

    async getWatchlist() {
        try {
            // Log ajustado
            console.log(`[MovieService] Buscando lista (usando endpoint de favoritos)`);
            // Chama a rota de buscar favoritos
            const response = await this.api.get(`/users/me/favorite-movies`);
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar lista (via favoritos):', error.response?.data || error.message || error);
            throw error;
        }
    }

    async removeFromWatchlist(tmdbMovieId) { // Novo método
        try {
            console.log(`[MovieService] Removendo filme ${tmdbMovieId} da lista (usando endpoint de favoritos)`);
            const response = await this.api.delete(`/users/me/favorite-movies/${tmdbMovieId.toString()}`);
            return response.data;
        } catch (error) {
            console.error('Erro ao remover filme da lista (via favoritos):', error.response?.data || error.message || error);
            throw error;
        }
    }


    async getMoviesForTinderMode(page = 1) {
        try {
            console.log(`[MovieService] Buscando filmes para Tinder Mode (página ${page}) em: ${this.api.defaults.baseURL}/movies/popular`);
            const response = await this.api.get('/movies/popular', {
                params: { page }
            });
            console.log(`[MovieService] Filmes para Tinder Mode (página ${page}) recebidos:`, response.data?.results?.length || response.data?.length);
            return response.data?.results || response.data || [];
        } catch (error) {
            console.error(`Erro ao buscar filmes para Tinder Mode (página ${page}):`, error.response?.data || error.message || error);
            throw error;
        }
    }

    async getTinderMoviesForParty(partyId) {
        if (!partyId) {
            console.error("[MovieService] partyId é necessário para buscar sugestões de filmes.");
            return [];
        }
        try {
            console.log(`[MovieService] Buscando sugestões de filmes para party ${partyId} em: ${this.api.defaults.baseURL}/movies/suggestions/party/${partyId}`);
            const response = await this.api.get(`/movies/suggestions/party/${partyId}`);
            return response.data;
        } catch (error) {
            console.error(`Erro ao buscar sugestões de filmes para party ${partyId}:`, error.response?.data || error.message || error);
            throw error;
        }
    }

    async getFavoriteMovies() {
        try {
            console.log(`[MovieService] Buscando filmes favoritos do usuário em: ${this.api.defaults.baseURL}/users/me/favorite-movies`);
            const response = await this.api.get(`/users/me/favorite-movies`);
            return response.data || [];
        } catch (error) {
            console.error('Erro ao buscar filmes favoritos (serviço):', error.response?.data || error.message || error);
            throw error.response?.data || new Error(error.message || 'Erro ao buscar filmes favoritos.');
        }
    }

    async addFavoriteMovie(tmdbMovieId) { // Renomeado parâmetro
        try {
            console.log(`[MovieService] Adicionando filme ${tmdbMovieId} aos favoritos em: ${this.api.defaults.baseURL}/users/me/favorite-movies`);
            // Backend POST /users/me/favorite-movies espera { movieId } no seu código atual
            // Se você padronizar para { apiMovieId } no backend, esta chamada fica correta.
            // Por enquanto, vou manter como apiMovieId, assumindo que você ajustará o backend ou que já espera isso.
            const response = await this.api.post(`/users/me/favorite-movies`, { apiMovieId: tmdbMovieId.toString() });
            return response.data;
        } catch (error) {
            console.error('Erro ao adicionar filme aos favoritos (serviço):', error.response?.data || error.message || error);
            throw error;
        }
    }

    async removeFavoriteMovie(tmdbMovieId) { // Renomeado parâmetro
        try {
            console.log(`[MovieService] Removendo filme ${tmdbMovieId} dos favoritos em: ${this.api.defaults.baseURL}/users/me/favorite-movies/${tmdbMovieId.toString()}`);
            const response = await this.api.delete(`/users/me/favorite-movies/${tmdbMovieId.toString()}`);
            return response.data;
        } catch (error) {
            console.error('Erro ao remover filme dos favoritos (serviço):', error.response?.data || error.message || error);
            throw error.response?.data || new Error(error.message || 'Erro ao remover filme dos favoritos.');
        }
    }
}

export default new MovieService();