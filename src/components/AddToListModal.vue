<template>
  <div v-if="show" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>{{ movie.title }}</h3>
        <button class="close-button" @click="closeModal">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="modal-body">
        <div class="success-animation" v-if="success">
          <i class="fas fa-check-circle"></i>
          <p>Filme adicionado à sua lista com sucesso!</p>
        </div>
        <div class="error-animation" v-if="error">
          <i class="fas fa-exclamation-circle"></i>
          <p>{{ errorMessage }}</p>
        </div>
        <div class="movie-preview">
          <img :src="movie.posterPath" :alt="movie.title" class="movie-poster">
          <div class="movie-info">
            <div class="movie-meta">
              <span class="year">{{ movie.year }}</span>
              <span class="rating">
                <i class="fas fa-star"></i> {{ movie.rating }}
              </span>
            </div>
            <div class="genres">
              <span v-for="genre in movie.genres.slice(0, 2)" :key="genre" class="genre-tag">
                {{ genre }}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="primary-button" @click="viewDetails">
          <i class="fas fa-info-circle"></i> Ver Detalhes
        </button>
        <button class="secondary-button" @click="closeModal">
          <i class="fas fa-times"></i> Fechar
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AddToListModal',
  props: {
    show: {
      type: Boolean,
      required: true
    },
    movie: {
      type: Object,
      required: true
    },
    success: {
      type: Boolean,
      default: false
    },
    error: {
      type: Boolean,
      default: false
    },
    errorMessage: {
      type: String,
      default: 'Ocorreu um erro ao adicionar o filme à lista.'
    }
  },
  methods: {
    closeModal() {
      this.$emit('close');
    },
    viewDetails() {
      this.$router.push(`/movie/${this.movie.id}`);
      this.closeModal();
    }
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.modal-content {
  background: var(--bg-color);
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--text-color);
}

.close-button {
  background: none;
  border: none;
  color: var(--secondary-text);
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
  transition: color 0.2s ease;
}

.close-button:hover {
  color: var(--text-color);
}

.modal-body {
  padding: 1.5rem;
}

.success-animation, .error-animation {
  text-align: center;
  margin-bottom: 1.5rem;
  animation: bounceIn 0.5s ease;
}

.success-animation i {
  font-size: 3rem;
  color: var(--success-color);
  margin-bottom: 1rem;
}

.error-animation i {
  font-size: 3rem;
  color: var(--error-color);
  margin-bottom: 1rem;
}

.movie-preview {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.movie-poster {
  width: 120px;
  height: 180px;
  border-radius: 8px;
  object-fit: cover;
}

.movie-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.movie-meta {
  display: flex;
  gap: 1rem;
  color: var(--secondary-text);
  font-size: 0.9rem;
}

.genres {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.genre-tag {
  background: var(--primary-color);
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.primary-button, .secondary-button {
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.primary-button {
  background: var(--primary-color);
  color: white;
}

.primary-button:hover {
  background: var(--primary-color-dark);
}

.secondary-button {
  background: var(--card-bg);
  color: var(--text-color);
}

.secondary-button:hover {
  background: var(--hover-bg);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes bounceIn {
  0% {
    transform: scale(0.3);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .modal-content {
    width: 95%;
  }
  
  .movie-preview {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .movie-poster {
    width: 150px;
    height: 225px;
  }
  
  .movie-info {
    align-items: center;
  }
  
  .modal-footer {
    flex-direction: column;
  }
  
  .primary-button, .secondary-button {
    width: 100%;
    justify-content: center;
  }
}
</style> 