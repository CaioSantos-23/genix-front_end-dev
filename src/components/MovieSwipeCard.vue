<template>
  <div
    class="movie-card"
    @mousedown="startSwipe"
    @mousemove="duringSwipe"
    @mouseup="endSwipe"
    @touchstart="startSwipe"
    @touchmove="duringSwipe"
    @touchend="endSwipe"
    :style="{
      transform: `translateX(${x}px) translateY(${y}px) rotate(${rotate}deg) scale(${scale})`,
      transition: transition,
      opacity: opacity,
      zIndex: zIndex
    }"
  >
    <div class="movie-poster">
      <img :src="movie.posterPath" :alt="movie.title" class="movie-image" />
      <div class="movie-overlay">
        <div class="movie-info">
          <h3 class="movie-title">{{ movie.title }}</h3>
          <div class="movie-meta">
            <span class="year">{{ movie.year }}</span>
            <span class="rating">
              <i class="fas fa-star"></i> {{ movie.rating }}
            </span>
          </div>
          <div class="movie-genres">
            <span v-for="genre in movie.genres.slice(0, 2)" :key="genre" class="genre-tag">
              {{ genre }}
            </span>
          </div>
          <p class="movie-description">{{ movie.description }}</p>
        </div>
      </div>
      <div class="swipe-overlay like" :style="{ opacity: likeOpacity }">
        <i class="fas fa-heart"></i>
        <span>Gostei!</span>
      </div>
      <div class="swipe-overlay dislike" :style="{ opacity: dislikeOpacity }">
        <i class="fas fa-times"></i>
        <span>Não Gostei</span>
      </div>
    </div>
  </div>
  <div class="swipe-buttons">
    <button class="swipe-button dislike" @click="dislikeMovie">
      <i class="fas fa-times"></i>
    </button>
    <button class="swipe-button like" @click="likeMovie">
      <i class="fas fa-heart"></i>
    </button>
  </div>
</template>

<script>
export default {
  props: {
    movie: {
      type: Object,
      required: true,
    },
    zIndex: {
      type: Number,
      default: 1
    }
  },
  data() {
    return {
      x: 0,
      y: 0,
      rotate: 0,
      scale: 1,
      startX: 0,
      startY: 0,
      isSwiping: false,
      transition: "transform 0.3s ease",
      opacity: 1,
      likeOpacity: 0,
      dislikeOpacity: 0,
      swipeThreshold: 100,
      maxRotation: 30
    };
  },
  methods: {
    startSwipe(event) {
      this.isSwiping = true;
      this.transition = "none";
      this.startX = event.clientX || (event.touches && event.touches[0].clientX) || 0;
      this.startY = event.clientY || (event.touches && event.touches[0].clientY) || 0;
    },
    duringSwipe(event) {
      if (!this.isSwiping) return;
      const clientX = event.clientX || (event.touches && event.touches[0].clientX);
      const clientY = event.clientY || (event.touches && event.touches[0].clientY);
      const swipeDistanceX = clientX - this.startX;
      const swipeDistanceY = clientY - this.startY;

      this.x = swipeDistanceX;
      this.y = swipeDistanceY;
      this.rotate = (swipeDistanceX / window.innerWidth) * this.maxRotation;
      this.scale = 1 - Math.abs(swipeDistanceX) / (window.innerWidth * 2);

      // Calculate opacity for like/dislike overlays
      const swipeProgress = Math.abs(swipeDistanceX) / this.swipeThreshold;
      if (swipeDistanceX > 0) {
        this.likeOpacity = Math.min(swipeProgress, 1);
        this.dislikeOpacity = 0;
      } else {
        this.likeOpacity = 0;
        this.dislikeOpacity = Math.min(swipeProgress, 1);
      }
    },
    endSwipe(event) {
      if (!this.isSwiping) return;
      this.isSwiping = false;
      this.transition = "transform 0.3s ease, opacity 0.3s ease";

      let swipeDistanceX = 0;
      if (event.changedTouches) {
        swipeDistanceX = event.changedTouches[0].clientX - this.startX;
      } else {
        swipeDistanceX = event.clientX - this.startX;
      }

      if (Math.abs(swipeDistanceX) > this.swipeThreshold) {
        this.opacity = 0;
        if (swipeDistanceX > 0) {
          this.x = window.innerWidth;
          this.$emit("like", this.movie);
        } else {
          this.x = -window.innerWidth;
          this.$emit("dislike", this.movie);
        }
        setTimeout(() => {
          this.resetCard();
        }, 300);
      } else {
        this.resetCard();
      }
    },
    resetCard() {
      this.x = 0;
      this.y = 0;
      this.rotate = 0;
      this.scale = 1;
      this.opacity = 1;
      this.likeOpacity = 0;
      this.dislikeOpacity = 0;
    },
    likeMovie() {
      this.x = window.innerWidth;
      this.opacity = 0;
      this.$emit("like", this.movie);
      setTimeout(() => {
        this.resetCard();
      }, 300);
    },
    dislikeMovie() {
      this.x = -window.innerWidth;
      this.opacity = 0;
      this.$emit("dislike", this.movie);
      setTimeout(() => {
        this.resetCard();
      }, 300);
    }
  },
};
</script>

<style scoped>
.movie-card {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: var(--card-bg);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  cursor: grab;
  user-select: none;
  overflow: hidden;
  will-change: transform;
}

.movie-poster {
  position: relative;
  width: 100%;
  height: 100%;
}

.movie-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background-color: var(--card-bg);
}

.movie-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.4));
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  align-items: flex-end;
  padding: 1.5rem;
}

.movie-card:hover .movie-overlay {
  opacity: 1;
}

.movie-info {
  color: white;
  width: 100%;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.9), transparent);
  padding: 1rem;
  border-radius: 8px;
}

.movie-title {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
  line-height: 1.3;
}

.movie-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  opacity: 0.9;
}

.movie-genres {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.genre-tag {
  background: var(--primary-color);
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
}

.movie-description {
  font-size: 0.9rem;
  line-height: 1.5;
  opacity: 0.9;
  margin-bottom: 1rem;
}

.swipe-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: white;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.swipe-overlay i {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.swipe-overlay span {
  font-size: 1.5rem;
  font-weight: 600;
}

.swipe-overlay.like {
  background: linear-gradient(45deg, rgba(76, 175, 80, 0.8), rgba(76, 175, 80, 0.4));
}

.swipe-overlay.dislike {
  background: linear-gradient(45deg, rgba(244, 67, 54, 0.8), rgba(244, 67, 54, 0.4));
}

.swipe-buttons {
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 2rem;
  padding: 1rem;
  margin-top: 1.5rem;
  box-sizing: border-box;
}

.swipe-button {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.swipe-button:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
}

.swipe-button.like {
  background: var(--success-color, #4CAF50);
  color: white;
}

.swipe-button.dislike {
  background: var(--error-color, #F44336);
  color: white;
}

@media (max-width: 768px) {
  .movie-title {
    font-size: 1.2rem;
  }

  .movie-meta {
    font-size: 0.8rem;
  }

  .genre-tag {
    font-size: 0.7rem;
  }

  .movie-description {
    font-size: 0.8rem;
  }

  .swipe-overlay i {
    font-size: 3rem;
  }

  .swipe-overlay span {
    font-size: 1.2rem;
  }

  .swipe-button {
    width: 56px;
    height: 56px;
    font-size: 1.2rem;
  }
}
</style>