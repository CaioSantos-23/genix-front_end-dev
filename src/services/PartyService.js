// src/services/PartyService.js
import axios from 'axios';

const API_URL_ROOT = process.env.VUE_APP_API_BASE_URL || 'http://localhost:8005/api';
const PARTIES_API_ENDPOINT = `${API_URL_ROOT}/parties`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.warn('[PartyService] Token não encontrado no localStorage para getAuthHeaders.');
    // Se a rota for protegida, a falta do header Authorization resultará em 401 pelo backend.
    // É importante que as rotas de backend que não requerem autenticação não falhem por falta deste header.
    // Se a rota é pública, o backend não deve exigir o header Authorization.
    // Se a rota é protegida, o backend responderá com 401 se o header estiver ausente ou inválido.
    return {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };
  }
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
};

class PartyService {
    async createParty(partyData) { // partyData = { title, hostGenres, initialMovieApiId? }
        const url = PARTIES_API_ENDPOINT; // POST para /api/parties
        console.log(`[PartyService] createParty chamando: ${url} com dados:`, partyData);
        try {
            const response = await axios.post(url, partyData, { headers: getAuthHeaders() });
            console.log('[PartyService] createParty - Resposta do backend:', response.data);
            // O backend deve retornar a party completa, incluindo o shortCode e _id.
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Erro desconhecido ao criar party.';
            console.error('[PartyService] Erro ao criar party:', errorMessage, error.response?.data || error);
            throw new Error(errorMessage);
        }
    }

    async joinParty(partyShortCode, userGenres = []) {
        const url = `${PARTIES_API_ENDPOINT}/code/${partyShortCode.toUpperCase()}/join`; // Garante shortCode em maiúsculas
        console.log(`[PartyService] joinParty (by shortCode) chamando: ${url} com userGenres:`, userGenres);
        try {
            const response = await axios.post(url, { userGenres }, { headers: getAuthHeaders() });
            console.log('[PartyService] joinParty - Resposta do backend:', response.data);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Erro desconhecido ao entrar na party.';
            console.error(`[PartyService] Erro ao entrar na party com código ${partyShortCode}:`, errorMessage, error.response?.data || error);
            throw new Error(errorMessage);
        }
    }
    
    async leaveParty(partyId) { // partyId aqui deve ser o _id do MongoDB
        const url = `${PARTIES_API_ENDPOINT}/${partyId}/leave`;
        console.log(`[PartyService] leaveParty chamando: ${url}`);
        try {
            const response = await axios.post(url, {}, { headers: getAuthHeaders() });
            console.log('[PartyService] leaveParty - Resposta do backend:', response.data);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Erro desconhecido ao sair da party.';
            console.error(`[PartyService] Erro ao sair da party ${partyId}:`, errorMessage, error.response?.data || error);
            throw new Error(errorMessage);
        }
    }

    async getPartyData(partyId) { // partyId aqui deve ser o _id do MongoDB
        const url = `${PARTIES_API_ENDPOINT}/${partyId}`;
        console.log(`[PartyService] getPartyData (by _id) chamando: ${url}`);
        try {
            const response = await axios.get(url, { headers: getAuthHeaders() });
            console.log('[PartyService] getPartyData - Resposta do backend:', response.data);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Erro desconhecido ao buscar dados da party.';
            console.error(`[PartyService] Erro ao buscar dados da party ${partyId}:`, errorMessage, error.response?.data || error);
            throw new Error(errorMessage);
        }
    }

    async getPartyByShortCode(shortCode) {
        const url = `${PARTIES_API_ENDPOINT}/code/${shortCode.toUpperCase()}`;
        console.log(`[PartyService] getPartyByShortCode chamando: ${url}`);
        try {
            const response = await axios.get(url, { headers: getAuthHeaders() });
            console.log('[PartyService] getPartyByShortCode - Resposta do backend:', response.data);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Erro desconhecido ao buscar party por código.';
            console.error(`[PartyService] Erro ao buscar party pelo shortCode ${shortCode}:`, errorMessage, error.response?.data || error);
            throw new Error(errorMessage);
        }
    }

    async addMovieToParty(partyId, movieData) { // partyId = _id; movieData = { apiMovieId, title, posterPath }
        const url = `${PARTIES_API_ENDPOINT}/${partyId}/movies`;
        console.log(`[PartyService] addMovieToParty chamando: ${url} com dados:`, movieData);
        try {
            const response = await axios.post(url, movieData, { headers: getAuthHeaders() });
            console.log('[PartyService] addMovieToParty - Resposta do backend:', response.data);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Erro desconhecido ao adicionar filme à party.';
            console.error(`[PartyService] Erro ao adicionar filme à party ${partyId}:`, errorMessage, error.response?.data || error);
            throw new Error(errorMessage);
        }
    }

    async likeMovie(partyId, apiMovieId) { // partyId = _id
        if (!partyId || !apiMovieId) {
            const errorMsg = `[PartyService] partyId (${partyId}) ou apiMovieId (${apiMovieId}) está indefinido para likeMovie.`;
            console.error(errorMsg);
            throw new Error(errorMsg);
        }
        const url = `${PARTIES_API_ENDPOINT}/${partyId}/movies/${apiMovieId}/like`;
        console.log(`[PartyService] likeMovie chamando: ${url}`);
        try {
            const response = await axios.post(url, {}, { headers: getAuthHeaders() });
            console.log("[PartyService] likeMovie - Resposta do backend:", response.data); // Espera-se { party, isMatch }
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Erro desconhecido ao dar like no filme.';
            console.error(`[PartyService] Erro ao dar like no filme (party: ${partyId}, movie: ${apiMovieId}):`, errorMessage, error.response?.data || error);
            throw new Error(errorMessage);
        }
    }

    // A rota para checkMatch pode ser útil para cenários específicos, mas muitas vezes
    // a informação de match já é retornada pela rota de 'like'. Avalie a necessidade.
    async checkMatch(partyId, apiMovieId) { // partyId = _id
        const url = `${PARTIES_API_ENDPOINT}/${partyId}/movies/${apiMovieId}/match`;
        console.log(`[PartyService] checkMatch chamando: ${url}`);
        try {
            const response = await axios.get(url, { headers: getAuthHeaders() });
            console.log('[PartyService] checkMatch - Resposta do backend:', response.data);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Erro desconhecido ao checar match.';
            console.error(`[PartyService] Erro ao checar match (party: ${partyId}, movie: ${apiMovieId}):`, errorMessage, error.response?.data || error);
            throw new Error(errorMessage);
        }
    }
}

export default new PartyService();