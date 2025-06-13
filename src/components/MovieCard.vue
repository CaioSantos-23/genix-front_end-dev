<template>
    <div class="movie-card" @click="viewDetails">
        <div class="movie-poster">
           <img v-if="movie.posterPath" :src="movie.posterPath" :alt="movie.title">
            <div class="movie-overlay">
                <div class="movie-info">
                    <h3>{{ movie.title }}</h3>
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
                    <button class="details-button">
                        <i class="fas fa-info-circle"></i> Ver Detalhes
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'MovieCard',
    props: {
        movie: {
            type: Object,
            required: true
        }
    },
    methods: {
        viewDetails() {
            const idForRoute = this.movie.apiMovieId || this.movie.id;
            this.$router.push(`/movie/${idForRoute}`).then(() => {
                window.scrollTo(0, 0);
            });
        }
    }
}
</script>

<style scoped>
.movie-card {
    position: relative;
    flex: 0 0 200px;
    height: 300px;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    background: var(--card-bg);
}

.movie-card:hover {
    transform: scale(1.05);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.movie-card:active {
    transform: scale(0.98);
}

.movie-poster {
    width: 100%;
    height: 100%;
    position: relative;
}

.movie-poster img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
}

.movie-card:hover .movie-poster img {
    transform: scale(1.1);
}

.movie-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.5) 50%, rgba(0, 0, 0, 0.3) 100%);
    display: flex;
    align-items: flex-end;
    padding: 1.5rem;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.movie-card:hover .movie-overlay {
    opacity: 1;
}

.movie-info {
    color: white;
    width: 100%;
    transform: translateY(20px);
    transition: transform 0.3s ease;
}

.movie-card:hover .movie-info {
    transform: translateY(0);
}

.movie-info h3 {
    margin: 0 0 0.5rem;
    font-size: 1.1rem;
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

.details-button {
    width: 100%;
    padding: 0.5rem;
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: all 0.2s ease;
    min-height: 44px;
    opacity: 0;
    transform: translateY(10px);
}

.movie-card:hover .details-button {
    opacity: 1;
    transform: translateY(0);
}

.details-button:hover {
    background: var(--primary-color-dark);
}

@media (max-width: 768px) {
    .movie-card {
        flex: 0 0 150px;
        height: 225px;
    }

    .movie-info h3 {
        font-size: 0.9rem;
        margin-bottom: 0.3rem;
    }

    .movie-meta {
        font-size: 0.8rem;
        gap: 0.5rem;
    }

    .genre-tag {
        font-size: 0.7rem;
        padding: 0.1rem 0.4rem;
    }

    .details-button {
        padding: 0.4rem;
        font-size: 0.8rem;
    }
}

@media (max-width: 480px) {
    .movie-card {
        flex: 0 0 140px;
        height: 210px;
    }

    .movie-info h3 {
        font-size: 0.8rem;
    }

    .movie-meta {
        font-size: 0.7rem;
    }

    .genre-tag {
        font-size: 0.6rem;
        padding: 0.1rem 0.3rem;
    }
}
</style> 