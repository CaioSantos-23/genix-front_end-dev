<template>
    <div class="movie-carousel">
        <div class="carousel-header">
            <h2>{{ title }}</h2>
            <div class="carousel-controls">
                <button @click="scrollLeft" class="nav-button" :disabled="!canScrollLeft" aria-label="Rolar para a esquerda">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <button @click="scrollRight" class="nav-button" :disabled="!canScrollRight" aria-label="Rolar para a direita">
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        </div>
        <div class="carousel-container" ref="container">
            <div class="carousel-content" ref="content">
                <MovieCard
                    v-for="movie in movies"
                    :key="movie.id"
                    :movie="movie"
                />
            </div>
        </div>
    </div>
</template>

<script>
import MovieCard from './MovieCard.vue';

export default {
    name: 'MovieCarousel',
    components: {
        MovieCard
    },
    props: {
        title: {
            type: String,
            required: true
        },
        movies: {
            type: Array,
            required: true
        }
    },
    data() {
        return {
            canScrollLeft: false,
            canScrollRight: false,
            scrollAmount: 0
        }
    },
    mounted() {
        this.checkScrollButtons();
        window.addEventListener('resize', this.checkScrollButtons);
        this.$refs.container.addEventListener('scroll', this.checkScrollButtons);
    },
    beforeUnmount() {
        window.removeEventListener('resize', this.checkScrollButtons);
        if (this.$refs.container) {
            this.$refs.container.removeEventListener('scroll', this.checkScrollButtons);
        }
    },
    methods: {
        scrollLeft() {
            const container = this.$refs.container;
            const scrollAmount = container.clientWidth * 0.8;
            container.scrollBy({
                left: -scrollAmount,
                behavior: 'smooth'
            });
        },
        scrollRight() {
            const container = this.$refs.container;
            const scrollAmount = container.clientWidth * 0.8;
            container.scrollBy({
                left: scrollAmount,
                behavior: 'smooth'
            });
        },
        checkScrollButtons() {
            const container = this.$refs.container;
            if (!container) return;

            this.canScrollLeft = container.scrollLeft > 0;
            this.canScrollRight = container.scrollLeft < (container.scrollWidth - container.clientWidth - 1);
        }
    }
}
</script>

<style scoped>
.carousel-section {
    margin: 2rem 0;
}

.carousel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding: 0 1rem;
}

.carousel-header h2 {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-color);
    margin: 0;
}

.carousel-controls {
    display: flex;
    gap: 0.5rem;
}

.nav-button {
    background: var(--card-bg);
    border: none;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    color: var(--text-color);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.nav-button:hover:not(:disabled) {
    background: var(--primary-color);
    color: white;
    transform: scale(1.1);
}

.nav-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.carousel-container {
    position: relative;
    overflow-x: auto;
    scroll-behavior: smooth;
    scrollbar-width: none;
    -ms-overflow-style: none;
    padding: 0.5rem;
    margin: 0 -0.5rem;
    -webkit-overflow-scrolling: touch;
}

.carousel-container::-webkit-scrollbar {
    display: none;
}

.carousel-content {
    display: flex;
    gap: 1rem;
    padding: 0.5rem;
}

@media (max-width: 768px) {
    .carousel-section {
        margin: 1.5rem 0;
    }

    .carousel-header {
        padding: 0 0.5rem;
        margin-bottom: 1rem;
    }

    .carousel-header h2 {
        font-size: 1.2rem;
    }

    .carousel-controls {
        display: none;
    }

    .carousel-container {
        padding: 0.25rem;
        scroll-snap-type: x mandatory;
    }

    .carousel-content {
        gap: 0.75rem;
        padding: 0.25rem;
    }

    .carousel-content > * {
        scroll-snap-align: start;
    }
}

@media (max-width: 480px) {
    .carousel-section {
        margin: 1rem 0;
    }

    .carousel-header {
        padding: 0 0.25rem;
    }

    .carousel-header h2 {
        font-size: 1.1rem;
    }

    .nav-button {
        width: 32px;
        height: 32px;
        font-size: 0.8rem;
    }

    .carousel-container {
        padding: 0.25rem;
    }

    .carousel-content {
        gap: 0.5rem;
        padding: 0.25rem;
    }
}

/* Touch-friendly scrolling */
.carousel-container {
    -webkit-overflow-scrolling: touch;
    scroll-snap-type: x mandatory;
}

.carousel-content > * {
    scroll-snap-align: start;
}
</style> 