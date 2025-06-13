<template>
    <div class="movie-view">
        <div v-if="loading" class="loading">
            <div class="spinner"></div>
            <p>Carregando detalhes do filme...</p>
        </div>
        <div v-else-if="error" class="error">
            <i class="fas fa-exclamation-circle"></i>
            <p>{{ error }}</p>
        </div>
        <MovieDetails 
            v-else 
            :movie="movie"
            @start-party="startParty"
            @add-to-watchlist="addToWatchlist"
        />
    </div>
</template>

<script>
import MovieDetails from '@/components/MovieDetails.vue';
import MovieService from '@/services/MovieService';
// Remova a importação da store se não estiver usando
// import { useAuthStore } from '@/stores/authStore';

export default {
    name: 'MovieView',
    components: {
        MovieDetails
    },
    data() {
        return {
            movie: null,
            loading: true,
            error: null
        }
    },
    methods: {
        async loadMovieDetails() {
            try {
                this.loading = true;
                this.error = null;
                const movieId = this.$route.params.id; // Este 'id' vem da URL
                console.log(`[MovieView] Carregando detalhes para movieId da rota: ${movieId}`);
                    this.movie = await MovieService.getMovieDetails(movieId); // MovieService deve chamar seu backend
                console.log("[MovieView] Detalhes do filme carregados:", this.movie);
                if (!this.movie) { // Checagem extra
                    throw new Error("Dados do filme não retornados pelo serviço.");
                }
            } catch (error) {
                this.error = error.message || 'Erro ao carregar detalhes do filme. Tente novamente.';
                console.error('Error loading movie details in MovieView:', error);
                
            } finally {
                this.loading = false;
            }
        },
        startParty(movie) { // movie aqui é this.movie
            const movieIdForParty = movie.apiMovieId || movie.id;
            console.log(`[MovieView] Iniciando party com filme ID: ${movieIdForParty}`);
            this.$router.push({
                name: 'party',
                query: { startWithMovieId: movieIdForParty, movieTitle: movie.title }
            }).then(() => {
                window.scrollTo(0, 0);
            });
        },
        async addToWatchlist(movie) { // movie aqui é this.movie
            try {
                // PEGAR DADOS DO USUÁRIO DO LOCALSTORAGE
                const userString = localStorage.getItem('user');
                const token = localStorage.getItem('token');

                if (!token || !userString) {
                    console.warn("MovieView: Tentativa de adicionar à watchlist sem token ou dados do usuário no localStorage.");
                    alert("Você precisa estar logado para adicionar à lista.");
                    this.$router.push('/login');
                    return;
                }

                const userData = JSON.parse(userString);
                const userId = userData.id || userData._id; 
                const movieId = movie.apiMovieId || movie.id;

                if (!userId || !movieId) {
                    alert("Erro: Não foi possível identificar o usuário ou o filme.");
                    return;
                }

                console.log(`[MovieView] Adicionando filme ID: ${movieId} à watchlist do usuário ID: ${userId}`);
                await MovieService.addToWatchlist(userId, movieId); 
                alert('Filme adicionado à sua lista!');
            } catch (error) {
                console.error('Error adding to watchlist:', error.response?.data || error.message || error);
                alert(error.response?.data?.message || error.message || 'Erro ao adicionar à lista.');
            }
        }
    },
    created() {
        this.loadMovieDetails();
    },

    watch: {
        '$route.params.id'(newId, oldId) {
            if (newId && newId !== oldId) {
                console.log(`[MovieView] ID da rota mudou para: ${newId}. Recarregando detalhes.`);
                this.loadMovieDetails();
            }
        }
    }

}
</script>

<style scoped>
.movie-view {
    min-height: 100vh;
    background: var(--bg-color);
}

.loading, .error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    gap: 1rem;
}

.error {
    color: var(--error-color);
}

.error i {
    font-size: 3rem;
}

.spinner {
    width: 50px;
    height: 50px;
    border: 4px solid var(--border-color);
    border-top-color: var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}
</style> 