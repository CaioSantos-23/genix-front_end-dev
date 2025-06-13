<template>
  <div class="tinder-mode">
    <section class="hero">
      <div class="hero-content">
        <h1>Encontre Seu Próximo Filme</h1>
        <p>Deslize para a direita para curtir ou para a esquerda para passar</p>
      </div>
    </section>

    <div class="content">
      <div v-if="loading" class="loading">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Carregando filmes...</p>
      </div>

      <div v-else-if="error" class="error">
        <i class="fas fa-exclamation-circle"></i>
        <p>{{ error }}</p>
      </div>

      <div v-else class="swipe-container">
        <div v-if="currentMovie" class="card-container">
          <MovieSwipeCard
            :movie="currentMovie"
            @like="likeCurrentMovie"
            @dislike="dislikeCurrentMovie"
          />
        </div>
        
        <div v-else class="results-container">
          <div v-if="likedMovies.length > 0">
            <h2>Filmes que você curtiu:</h2>
            <div class="liked-movies-grid">
              <div v-for="movie in likedMovies" :key="movie.id" class="liked-movie-card">
                <img v-if="movie.posterPath" :src="movie.posterPath" :alt="movie.title">
                <div class="liked-movie-info">
                  <h3>{{ movie.title }}</h3>
                  <div class="movie-meta">
                    <span>{{ movie.year }}</span>
                    <span>
                      <i class="fas fa-star"></i> {{ movie.rating }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <button class="restart-button" @click="restartSwipe">
              <i class="fas fa-redo"></i> Começar Novamente
            </button>
          </div>
          <div v-else class="no-movies">
            <i class="fas fa-film"></i>
            <p>Nenhum filme avaliado ainda</p>
            <button class="restart-button" @click="restartSwipe">
              <i class="fas fa-redo"></i> Começar Novamente
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import MovieSwipeCard from "@/components/MovieSwipeCard.vue";
import MovieService from "@/services/MovieService";
// Não precisa do PartyService para o modo individual

export default {
  name: "TinderMode",
  components: {
    MovieSwipeCard,
  },
  data() {
    return {
      allMoviesForSession: [],
      currentMovieIndex: -1,
      sessionLikedMovies: [], // Para mostrar na UI os filmes curtidos nesta sessão
      sessionSwipedMovieIds: new Set(),
      loading: true,
      error: null,
      currentPage: 1,
      isLoadingMore: false,
    };
  },
  computed: {
    currentMovie() {
      if (this.currentMovieIndex >= 0 && this.currentMovieIndex < this.allMoviesForSession.length) {
        return this.allMoviesForSession[this.currentMovieIndex];
      }
      return null;
    }
  },
  methods: {
    async loadInitialMovies() {
      this.currentPage = 1;
      this.allMoviesForSession = [];
      this.sessionLikedMovies = [];
      this.sessionSwipedMovieIds.clear();
      this.currentMovieIndex = -1;
      await this.fetchMoreMovies();
    },

    async fetchMoreMovies() {
      if (this.isLoadingMore) return;
      if (this.allMoviesForSession.length === 0) {
          this.loading = true;
      }
      this.isLoadingMore = true;
      this.error = null;
      try {
        console.log(`[TinderMode] Buscando página ${this.currentPage} de filmes...`);
        const newMovies = await MovieService.getMoviesForTinderMode(this.currentPage);
        if (newMovies && newMovies.length > 0) {
          const unseenMovies = newMovies.filter(
            movie => !this.sessionSwipedMovieIds.has(movie.apiMovieId)
          );
          this.allMoviesForSession.push(...unseenMovies);
          if (this.currentMovieIndex === -1 && this.allMoviesForSession.length > 0) {
            this.currentMovieIndex = 0;
             // Encontra o primeiro realmente não visto, caso a lista inicial já tenha sido varrida
            let firstUnseenIdx = this.allMoviesForSession.findIndex(m => !this.sessionSwipedMovieIds.has(m.apiMovieId));
            this.currentMovieIndex = (firstUnseenIdx !== -1) ? firstUnseenIdx : -1;
          }
          this.currentPage++;
        } else {
          if (this.allMoviesForSession.length === 0 && this.currentMovieIndex === -1) {
            this.error = "Não há filmes disponíveis para mostrar.";
          }
        }
      } catch (error) {
        this.error = error.message || 'Erro ao carregar filmes.';
      } finally {
        this.loading = false;
        this.isLoadingMore = false;
      }
    },

    async handleSwipeAction(isLike) {
      if (!this.currentMovie) return;
      const swipedMovie = this.currentMovie;
      this.sessionSwipedMovieIds.add(swipedMovie.apiMovieId);

      if (isLike) {
        this.sessionLikedMovies.push(swipedMovie);
        console.log(`[TinderMode] Like no filme: ${swipedMovie.title} (ID: ${swipedMovie.apiMovieId})`);
        try {
          // USA A FUNÇÃO CORRETA DO MovieService
          await MovieService.addToWatchlist(swipedMovie.apiMovieId);
          console.log(`"${swipedMovie.title}" adicionado aos favoritos.`);
          // alert(`"${swipedMovie.title}" adicionado aos seus favoritos!`); // Substitua se não usar toast
        } catch (err) {
          console.error("Erro ao adicionar aos favoritos:", err);
          // alert(err.message || "Erro ao salvar como favorito."); // Substitua
          // Remover da lista de curtidos da sessão se falhar no backend
          this.sessionLikedMovies = this.sessionLikedMovies.filter(m => m.apiMovieId !== swipedMovie.apiMovieId);
          this.sessionSwipedMovieIds.delete(swipedMovie.apiMovieId); // Permite tentar de novo
        }
      } else {
        console.log(`[TinderMode] Dislike no filme: ${swipedMovie.title} (ID: ${swipedMovie.apiMovieId})`);
        // Opcional: MovieService.markMovieAsSeenOrDisliked(swipedMovie.apiMovieId, 'disliked_in_tinder');
      }
      this.moveToNextAvailableMovie();
    },

    likeCurrentMovie() {
      this.handleSwipeAction(true);
    },

    dislikeCurrentMovie() {
      this.handleSwipeAction(false);
    },

    moveToNextAvailableMovie() {
      let nextIndex = this.currentMovieIndex + 1;
      while (nextIndex < this.allMoviesForSession.length && this.sessionSwipedMovieIds.has(this.allMoviesForSession[nextIndex].apiMovieId)) {
        nextIndex++;
      }

      if (nextIndex < this.allMoviesForSession.length) {
        this.currentMovieIndex = nextIndex;
      } else {
        this.currentMovieIndex = -1; // Fim da lista atual
      }

      if (!this.currentMovie) {
        console.log("[TinderMode] Fim da lista atual. Tentando carregar mais...");
        // Não chama fetchMoreMovies diretamente aqui para evitar loops se não houver mais filmes.
        // A UI mostrará a seção de resultados. O usuário pode clicar em "Deslizar Novamente".
        if (this.allMoviesForSession.every(m => this.sessionSwipedMovieIds.has(m.apiMovieId))) {
            console.log("[TinderMode] Todos os filmes carregados foram deslizados.");
        } else {
            // Ainda pode haver filmes na lista que não foram alcançados, tenta buscar mais
            this.fetchMoreMovies();
        }
      } else {
         console.log("[TinderMode] Próximo filme:", this.currentMovie?.title);
      }
    },

    restartSwipeSession() {
      this.loadInitialMovies();
    }
  },
  created() {
    const token = localStorage.getItem('token');
    if (!token) {
      this.$router.push('/login');
      return;
    }
    this.loadInitialMovies();
  }
};
</script>

<style scoped>
.tinder-mode {
  min-height: 100vh;
  background: var(--bg-color);
  display: flex;
  flex-direction: column;
}

.hero {
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: white;
  padding: 2rem 1rem;
  position: relative;
  overflow: hidden;
}

.hero-content h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.hero-content p {
  font-size: 1.2rem;
  opacity: 0.9;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

.loading, .error {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  color: var(--text-secondary);
}

.loading i, .error i {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error i {
  color: var(--error-color);
}

.swipe-container {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem 0;
}

.card-container {
  width: 100%;
  aspect-ratio: 2/3;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.results-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
}

.results-container h2 {
  font-size: 2rem;
  margin-bottom: 2rem;
  color: var(--text-color);
}

.liked-movies-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-bottom: 2rem;
  justify-content: center;
  width: 100%;
}

.liked-movie-card {
  flex: 0 0 200px;
  background: var(--card-bg);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.liked-movie-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.liked-movie-card img {
  width: 100%;
  height: 280px;
  object-fit: cover;
}

.liked-movie-info {
  padding: 1rem;
  background: linear-gradient(to top, var(--card-bg), rgba(0, 0, 0, 0.8));
}

.liked-movie-info h3 {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  color: white;
  font-weight: 600;
}

.movie-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
}

.no-movies {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
}

.no-movies i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: var(--primary-color);
}

.restart-button {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: transform 0.2s ease, background-color 0.2s ease;
}

.restart-button:hover {
  transform: translateY(-2px);
  background-color: var(--primary-color-dark);
}

@media (max-width: 768px) {
  .hero-content h1 {
    font-size: 2rem;
  }

  .hero-content p {
    font-size: 1rem;
  }

  .content {
    padding: 1rem;
  }

  .swipe-container {
    max-width: 350px;
  }
}
</style>