const express = require('express');
const router = express.Router();
const axios = require('axios');
const authMiddleware = require('../middleware/authMiddleware'); // Para rotas que podem precisar de contexto de usuário/party
const Party = require('../models/Party'); // Para buscar gêneros da party para sugestões

// USAREMOS O TOKEN DE ACESSO V4
const TMDB_API_KEY_V3 = process.env.TMDB_API_KEY_V3;
const TMDB_BASE_URL_V3 = 'https://api.themoviedb.org/3'; // Ainda usaremos os endpoints da v3, mas com autenticação v4
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';

// --- Função Auxiliar para Requisições ao TMDB (usando Chave v3) ---
const fetchFromTMDB = async (endpoint, params = {}) => {
    console.log("[MovieRoutes - fetchFromTMDB] Tentando buscar endpoint:", endpoint);
    console.log("[MovieRoutes - fetchFromTMDB] Usando TMDB_API_KEY_V3:", TMDB_API_KEY_V3); // LOG

    if (!TMDB_API_KEY_V3) {
        console.error("[MovieRoutes - fetchFromTMDB] ERRO CRÍTICO: TMDB_API_KEY_V3 não está definido!");
        throw new Error("Configuração do servidor: Chave da API TMDB (v3) ausente.");
    }

    try {
        const response = await axios.get(`${TMDB_BASE_URL_V3}${endpoint}`, {
            params: { // A chave v3 vai nos parâmetros da URL
                api_key: TMDB_API_KEY_V3, // <<< AQUI
                language: 'pt-BR',
                ...params
            }
            // Não precisa mais do header 'Authorization' para este método
        });
        console.log(`[MovieRoutes - fetchFromTMDB] Sucesso ao buscar ${endpoint}. Status: ${response.status}`);
        return response.data;
    } catch (error) {
        // ... (seu tratamento de erro existente, que já é bom) ...
        let errorMessage = 'Erro desconhecido ao comunicar com a API de filmes.';
        let errorStatus = 500;
        let tmdbResponseData = null;

        if (error.response) {
            tmdbResponseData = error.response.data;
            errorMessage = tmdbResponseData?.status_message || error.message;
            errorStatus = error.response.status;
            console.error(
                `[MovieRoutes - fetchFromTMDB] Erro na RESPOSTA do TMDB para ${endpoint}: \n` +
                `  Status TMDB: ${errorStatus}\n` +
                `  Mensagem TMDB: ${errorMessage}\n`,
                `  Dados da Resposta TMDB:`, tmdbResponseData
            );
        } else if (error.request) { /* ... */ } else { /* ... */ }
        
        const errToThrow = new Error(errorMessage);
        errToThrow.status = (errorStatus === 401 || errorStatus === 403 || errorStatus === 404) ? errorStatus : 502;
        errToThrow.tmdb_error_details = tmdbResponseData;
        throw errToThrow;
    }
};

// --- Função Auxiliar para Formatar Filmes (mesma de antes) ---
const formatMovieData = (tmdbMovie) => {
    if (!tmdbMovie) return null;
    return {
        apiMovieId: tmdbMovie.id?.toString(),
        title: tmdbMovie.title,
        overview: tmdbMovie.overview,
        posterPath: tmdbMovie.poster_path ? `${TMDB_IMAGE_BASE_URL}w500${tmdbMovie.poster_path}` : null,
        backdropPath: tmdbMovie.backdrop_path ? `${TMDB_IMAGE_BASE_URL}original${tmdbMovie.backdrop_path}` : null,
        releaseDate: tmdbMovie.release_date,
        rating: tmdbMovie.vote_average,
        voteCount: tmdbMovie.vote_count,
        genres: tmdbMovie.genres ? tmdbMovie.genres.map(g => g.name) : (tmdbMovie.genre_ids ? [] : undefined),
        year: tmdbMovie.release_date ? tmdbMovie.release_date.substring(0, 4) : null,
        duration: tmdbMovie.runtime ? `${Math.floor(tmdbMovie.runtime / 60)}h ${tmdbMovie.runtime % 60}min` : "N/A",
        description: tmdbMovie.overview,
    };
};

const formatMovieList = (tmdbMovieList) => {
    if (!Array.isArray(tmdbMovieList)) return [];
    return tmdbMovieList.map(formatMovieData).filter(movie => movie != null);
};


// Cache para o mapa de gêneros do TMDB
let genreTmdbMap = null;
async function getGenreTmdbMap() {
    if (genreTmdbMap) return genreTmdbMap;
    try {
        console.log("[MovieRoutes] Buscando lista de gêneros do TMDB...");
        const data = await fetchFromTMDB('/genre/movie/list'); // Usa fetchFromTMDB que agora usa token v4
        genreTmdbMap = new Map(); // Usar Map é mais eficiente
        data.genres.forEach(genre => {
            genreTmdbMap.set(genre.name.toLowerCase(), genre.id);
            genreTmdbMap.set(genre.id.toString(), genre.id); // Permite busca por ID string também
        });
        console.log("[MovieRoutes] Mapa de gêneros TMDB carregado e cacheado.");
        return genreTmdbMap;
    } catch (error) {
        console.error("[MovieRoutes] Erro ao buscar lista de gêneros do TMDB:", error.message);
        return new Map(); // Retorna mapa vazio em caso de erro para evitar quebrar outras lógicas
    }
}
// Carrega o mapa de gêneros na inicialização ou na primeira necessidade
getGenreTmdbMap();


// --- ROTAS DE FILMES ---

// ROTA: Buscar filmes populares
router.get('/popular', async (req, res) => {
    try {
        const page = req.query.page || 1;
        const data = await fetchFromTMDB('/movie/popular', { page });
        res.json(formatMovieList(data.results));
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
});

// ROTA: Buscar filmes em alta (trending) na semana
router.get('/trending', async (req, res) => {
    try {
        const page = req.query.page || 1;
        const data = await fetchFromTMDB('/trending/movie/week', { page });
        res.json(formatMovieList(data.results));
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
});


router.get('/now-playing', async (req, res) => {
    console.log("[GET /api/movies/now-playing] Rota acessada.");
    try {
        const page = req.query.page || 1;
        const data = await fetchFromTMDB('/movie/now_playing', { page }); // Endpoint TMDB para "Em Cartaz"
        res.json(formatMovieList(data.results));
    } catch (error) {
        console.error("[GET /api/movies/now-playing] Erro:", error.message);
        res.status(error.status || 500).json({ message: error.message, details: error.tmdb_error_details });
    }
});


router.get('/top-rated', async (req, res) => {
    console.log("[GET /api/movies/top-rated] Rota acessada.");
    try {
        const page = req.query.page || 1;
        const data = await fetchFromTMDB('/movie/top_rated', { page }); // Endpoint TMDB para "Mais Bem Avaliados"
        res.json(formatMovieList(data.results));
    } catch (error) {
        console.error("[GET /api/movies/top-rated] Erro:", error.message);
        res.status(error.status || 500).json({ message: error.message, details: error.tmdb_error_details });
    }
});


router.get('/search', async (req, res) => {
    const query = req.query.query;
    const page = req.query.page || 1;
    console.log(`[GET /api/movies/search] Rota acessada com query: "${query}", page: ${page}`);
    if (!query) {
        return res.status(400).json({ message: "Parâmetro 'query' é obrigatório para busca." });
    }
    try {
        const data = await fetchFromTMDB('/search/movie', { query, page });
        res.json(formatMovieList(data.results));
    } catch (error) {
        console.error(`[GET /api/movies/search] Erro para query "${query}":`, error.message);
        res.status(error.status || 500).json({ message: error.message, details: error.tmdb_error_details });
    }
});


// ROTA: Buscar detalhes de um filme específico
router.get('/:apiMovieId/details', async (req, res) => {
    try {
        const { apiMovieId } = req.params;
        const data = await fetchFromTMDB(`/movie/${apiMovieId}`, { append_to_response: 'credits,videos' });
        const movieDetails = {
            ...formatMovieData(data),
            runtime: data.runtime,
            genres: data.genres?.map(g => g.name) || [],
            cast: data.credits?.cast.slice(0, 10).map(c => ({
                name: c.name,
                character: c.character,
                photo: c.profile_path ? `${TMDB_IMAGE_BASE_URL}w185${c.profile_path}` : null
            })) || [],
            director: data.credits?.crew.find(c => c.job === 'Director')?.name || null,
            trailerKey: data.videos?.results.find(v => v.site === 'YouTube' && v.type === 'Trailer')?.key || null
        };
        res.json(movieDetails);
    } catch (error) {
        const statusCode = error.response?.data?.status_code; // TMDB às vezes usa status_code no corpo
        if (statusCode === 34 || (error.status === 404)) { // 34 é "resource not found" no TMDB
            return res.status(404).json({ message: 'Filme não encontrado na API externa.' });
        }
        res.status(error.status || 500).json({ message: error.message });
    }
});

// ROTA: Buscar filmes por gênero
router.get('/genre/:genreIdentifier', async (req, res) => {
    try {
        const { genreIdentifier } = req.params;
        const page = req.query.page || 1;
        const currentGenreMap = await getGenreTmdbMap();
        
        let genreId;
        if (currentGenreMap.has(genreIdentifier.toLowerCase())) {
            genreId = currentGenreMap.get(genreIdentifier.toLowerCase());
        } else if (currentGenreMap.has(genreIdentifier)) { // Tenta como ID string
            genreId = currentGenreMap.get(genreIdentifier);
        }

        if (!genreId) {
            return res.status(404).json({ message: `Gênero "${genreIdentifier}" não reconhecido ou não mapeado.` });
        }

        const data = await fetchFromTMDB('/discover/movie', { with_genres: genreId.toString(), page, sort_by: 'popularity.desc' });
        res.json(formatMovieList(data.results));
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
});

// ROTA: Buscar sugestões de filmes para uma Party (Tinder Mode)
// Esta rota precisa do token do usuário da SUA aplicação para identificar a party
router.get('/suggestions/party/:partyId', authMiddleware, async (req, res) => {
    console.log(`[MovieSuggestions] Rota acessada para partyId: ${req.params.partyId} por usuário ${req.user._id}`);
    try {
        const party = await Party.findById(req.params.partyId).populate('members.userId', 'name favoriteGenres');
        if (!party) {
            console.log(`[MovieSuggestions] Party ${req.params.partyId} não encontrada.`);
            return res.status(404).json({ message: 'Festa não encontrada.' });
        }

        let allGenreNamesForParty = new Set();
        (party.hostGenres || []).forEach(genreName => allGenreNamesForParty.add(genreName.trim().toLowerCase()));
        party.members.forEach(member => {
            (member.selectedGenres || []).forEach(genreName => allGenreNamesForParty.add(genreName.trim().toLowerCase()));
        });
        console.log(`[MovieSuggestions] Gêneros combinados (nomes) para party ${req.params.partyId}:`, Array.from(allGenreNamesForParty));

        const currentGenreMap = await getGenreTmdbMap();
        const genreIdsForQuery = Array.from(allGenreNamesForParty)
            .map(name => currentGenreMap.get(name))
            .filter(id => id != null);

        let moviesData;
        if (genreIdsForQuery.length === 0) {
            console.log(`[MovieSuggestions] Party ${req.params.partyId} sem IDs de gênero TMDB válidos, buscando populares.`);
            moviesData = await fetchFromTMDB('/movie/popular', { page: req.query.page || 1 });
        } else {
            const genreIdString = genreIdsForQuery.join(',');
            console.log(`[MovieSuggestions] Buscando com IDs de gênero TMDB: ${genreIdString} para party ${req.params.partyId}`);
            moviesData = await fetchFromTMDB('/discover/movie', {
                with_genres: genreIdString,
                sort_by: 'popularity.desc',
                'vote_count.gte': 100,
                page: req.query.page || 1
            });
        }
        
        const suggestions = formatMovieList(moviesData.results);
        console.log(`[MovieSuggestions] Encontradas ${suggestions.length} sugestões para party ${req.params.partyId}.`);
        res.json(suggestions.slice(0, 20)); // Limita a 20 sugestões

    } catch (error) {
        console.error(`[MovieSuggestions] Erro ao buscar sugestões para party ${req.params.partyId}:`, error.message);
        res.status(error.status || 500).json({ message: error.message });
    }
});

module.exports = router;