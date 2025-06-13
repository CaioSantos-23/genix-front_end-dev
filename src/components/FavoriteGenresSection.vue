<template>
  <div class="profile-section">
    <h3>
      <i class="fas fa-film"></i>
      Gêneros Favoritos
    </h3>
    <p class="section-description">Selecione até 5 gêneros favoritos para personalizar suas recomendações</p>
    <div class="genres-grid">
      <button
        v-for="genre in availableGenres"
        :key="genre.id"
        :class="['genre-chip', { selected: favoriteGenres.includes(genre.id) }]"
        @click="$emit('genre-toggled', genre.id)"
        :disabled="isLoading || (!favoriteGenres.includes(genre.id) && favoriteGenres.length >= 5)"
        :aria-pressed="favoriteGenres.includes(genre.id)"
        :aria-label="genre.name"
      >
        <i :class="getGenreIcon(genre.name)"></i>
        <span>{{ genre.name }}</span>
        <span v-if="favoriteGenres.includes(genre.id)" class="selected-indicator">
          <i class="fas fa-check"></i>
        </span>
      </button>
    </div>
    <div class="genres-counter" :class="{ 'max-reached': favoriteGenres.length >= 5 }">
      <i class="fas fa-info-circle"></i>
      {{ favoriteGenres.length }}/5 gêneros selecionados
    </div>
  </div>
</template>

<script>
export default {
  name: 'FavoriteGenresSection',
  props: {
    favoriteGenres: {
      type: Array,
      required: true,
      default: () => []
    },
    availableGenres: {
      type: Array,
      required: true,
      default: () => []
    },
    isLoading: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    getGenreIcon(genre) {
      const icons = {
        'Ação': 'fas fa-fire',
        'Aventura': 'fas fa-compass',
        'Comédia': 'fas fa-laugh',
        'Drama': 'fas fa-theater-masks',
        'Ficção Científica': 'fas fa-rocket',
        'Terror': 'fas fa-ghost',
        'Romance': 'fas fa-heart',
        'Animação': 'fas fa-child',
        'Documentário': 'fas fa-film',
        'Suspense': 'fas fa-mask',
        'Crime': 'fas fa-fingerprint',
        'Família': 'fas fa-users',
        'Fantasia': 'fas fa-hat-wizard',
        'História': 'fas fa-landmark',
        'Música': 'fas fa-music',
        'Mistério': 'fas fa-search',
        'Guerra': 'fas fa-fighter-jet',
        'Western': 'fas fa-horse'
      }
      return icons[genre] || 'fas fa-film'
    }
  }
}
</script>

<style scoped>
.profile-section {
  background-color: var(--header-bg);
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.profile-section h3 {
  margin-bottom: 1.5rem;
  font-size: 1.6rem;
  color: var(--text-color);
  font-weight: 700;
  position: relative;
  padding-bottom: 0.8rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  letter-spacing: -0.02em;
}

.profile-section h3 i {
  color: #4CAF50;
  font-size: 1.4rem;
  position: relative;
  display: inline-block;
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 2px 4px rgba(76, 175, 80, 0.2));
}

@supports not (-webkit-background-clip: text) {
  .profile-section h3 i {
    background: none;
    color: #4CAF50;
  }
}

.profile-section h3::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 60px;
  height: 4px;
  background: linear-gradient(to right, #4CAF50, #45a049);
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(76, 175, 80, 0.2);
}

.section-description {
  color: var(--secondary-text);
  margin-bottom: 2rem;
  font-size: 1rem;
  line-height: 1.6;
  opacity: 0.9;
}

.genres-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 1.2rem;
  margin-bottom: 2rem;
}

.genre-chip {
  padding: 1.2rem;
  border-radius: 14px;
  background-color: var(--search-bg);
  color: var(--text-color);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  font-weight: 600;
  height: 64px;
  width: 100%;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(8px);
  letter-spacing: 0.01em;
}

.genre-chip i {
  font-size: 1.2rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.genre-chip:not(:disabled):hover {
  background-color: var(--hover-bg);
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
}

.genre-chip:not(:disabled):hover i {
  transform: scale(1.2) rotate(8deg);
}

.genre-chip.selected {
  border-color: #4CAF50;
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(69, 160, 73, 0.2));
  color: #4CAF50;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.15);
}

.genre-chip.selected i {
  color: #4CAF50;
  text-shadow: 0 2px 4px rgba(76, 175, 80, 0.2);
}

.genre-chip:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: var(--search-bg);
  transform: none;
}

.selected-indicator {
  position: absolute;
  top: -2px;
  right: -2px;
  background: linear-gradient(135deg, #4CAF50, #45a049);
  color: white;
  padding: 0.3rem;
  border-bottom-left-radius: 10px;
  font-size: 0.8rem;
  transform: translate(50%, -50%);
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(76, 175, 80, 0.2);
}

.genre-chip.selected .selected-indicator {
  opacity: 1;
  transform: translate(0, 0);
}

.genres-counter {
  text-align: center;
  color: var(--secondary-text);
  font-size: 1rem;
  font-weight: 600;
  margin-top: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  padding: 1rem;
  border-radius: 12px;
  background: var(--search-bg);
  backdrop-filter: blur(8px);
  transition: all 0.3s ease;
}

.genres-counter i {
  font-size: 1.1rem;
  color: #4CAF50;
}

.genres-counter.max-reached {
  color: #f44336;
  background: rgba(244, 67, 54, 0.1);
}

.genres-counter.max-reached i {
  color: #f44336;
}

@media (max-width: 768px) {
  .profile-section {
    padding: 1.5rem;
  }

  .genres-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 1rem;
  }

  .genre-chip {
    padding: 1rem;
    font-size: 0.9rem;
    height: 56px;
    border-radius: 12px;
  }

  .section-description {
    font-size: 0.9rem;
  }

  .genres-counter {
    font-size: 0.9rem;
    padding: 0.8rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .genre-chip,
  .genre-chip i,
  .selected-indicator {
    transition: none;
    transform: none;
  }

  .genre-chip:hover {
    transform: none;
  }
}

@media (hover: hover) {
  .genre-chip:not(:disabled):hover {
    background: linear-gradient(135deg, var(--hover-bg), var(--search-bg));
  }

  .genre-chip.selected:hover {
    background: linear-gradient(135deg, rgba(76, 175, 80, 0.15), rgba(69, 160, 73, 0.25));
  }
}
</style> 