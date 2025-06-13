<template>
  <div v-if="show" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>Avaliar {{ movie.title }}</h3>
        <button class="close-button" @click="closeModal">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="modal-body">
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

        <div class="rating-section">
          <div class="stars-container">
            <i 
              v-for="n in 10" 
              :key="n" 
              class="fas fa-star star-icon"
              :class="{ 'active': n <= selectedRating }"
              @click="selectedRating = n"
              @mouseover="hoverRating = n"
              @mouseleave="hoverRating = 0"
            ></i>
          </div>
          <p class="rating-text">{{ getRatingText }}</p>
        </div>

        <div class="review-section">
          <textarea 
            v-model="reviewText"
            placeholder="Escreva sua avaliação (opcional)"
            rows="4"
            class="review-input"
          ></textarea>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="secondary-button" @click="closeModal">
          <i class="fas fa-times"></i> Cancelar
        </button>
        <button 
          class="primary-button" 
          @click="submitRating"
          :disabled="!selectedRating"
        >
          <i class="fas fa-star"></i> Avaliar
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RatingModal',
  props: {
    show: {
      type: Boolean,
      required: true
    },
    movie: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      selectedRating: 0,
      hoverRating: 0,
      reviewText: ''
    }
  },
  computed: {
    getRatingText() {
      if (!this.selectedRating) return 'Selecione uma avaliação'
      const rating = this.selectedRating
      if (rating <= 2) return 'Ruim'
      if (rating <= 4) return 'Regular'
      if (rating <= 6) return 'Bom'
      if (rating <= 8) return 'Muito Bom'
      return 'Excelente'
    }
  },
  methods: {
    closeModal() {
      this.$emit('close')
      this.resetForm()
    },
    submitRating() {
      this.$emit('submit', {
        rating: this.selectedRating,
        review: this.reviewText
      })
      this.closeModal()
    },
    resetForm() {
      this.selectedRating = 0
      this.hoverRating = 0
      this.reviewText = ''
    }
  }
}
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

.movie-preview {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
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

.rating-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.stars-container {
  display: flex;
  gap: 0.5rem;
}

.star-icon {
  font-size: 2rem;
  color: var(--secondary-text);
  cursor: pointer;
  transition: color 0.2s ease;
}

.star-icon.active {
  color: #FFC107;
}

.rating-text {
  font-size: 1.1rem;
  color: var(--text-color);
  margin: 0;
}

.review-section {
  margin-bottom: 1rem;
}

.review-input {
  width: 100%;
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--card-bg);
  color: var(--text-color);
  font-size: 0.9rem;
  resize: vertical;
  min-height: 100px;
}

.review-input:focus {
  outline: none;
  border-color: var(--primary-color);
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

.primary-button:hover:not(:disabled) {
  background: var(--primary-color-dark);
}

.primary-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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