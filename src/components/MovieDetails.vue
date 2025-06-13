<template>
    <div class="movie-details-container">
        <div class="backdrop" :style="{ backgroundImage: `url(${movie.backdrop})` }">
            <div class="backdrop-overlay"></div>
        </div>
        
        <div class="movie-details">
            <div class="movie-header">
                <div class="poster-container">
                    <img :src="movie.posterPath" :alt="movie.title" class="movie-poster" />
                    <div class="rating-badge">
                        <span class="rating-value">{{ movie.rating }}</span>
                        <span class="rating-max">/10</span>
                    </div>
                </div>
                
                <div class="movie-info">
                    <h1 class="movie-title">{{ movie.title }}</h1>
                    <div class="movie-meta">
                        <span class="year"><i class="fas fa-calendar-alt"></i> {{ movie.year }}</span>
                        <span class="duration"><i class="fas fa-clock"></i> {{ movie.duration }}</span>
                        <span class="language"><i class="fas fa-globe"></i> {{ movie.language }}</span>
                    </div>
                    
                    <div class="genres">
                        <span v-for="genre in movie.genres" :key="genre" class="genre-tag">
                            {{ genre }}
                        </span>
                    </div>
                    
                    <div class="movie-actions">
                        <button @click="startParty" class="action-button party-button">
                            <i class="fas fa-users"></i> Assistir em Grupo
                        </button>
                        <button @click="addToWatchlist" class="action-button watchlist-button">
                            <i class="fas fa-plus"></i> Adicionar à Lista
                        </button>
                        <button class="action-button rate-button">
                            <i class="fas fa-star"></i> Avaliar
                        </button>
                    </div>
                </div>
            </div>

            <div class="tabs-container">
                <div class="tabs">
                    <button 
                        class="tab-button" 
                        :class="{ active: activeTab === 'overview' }"
                        @click="activeTab = 'overview'"
                    >
                        Visão Geral
                    </button>
                    <button 
                        class="tab-button" 
                        :class="{ active: activeTab === 'cast' }"
                        @click="activeTab = 'cast'"
                    >
                        Elenco & Equipe
                    </button>
                    <button 
                        class="tab-button" 
                        :class="{ active: activeTab === 'reviews' }"
                        @click="activeTab = 'reviews'"
                    >
                        Avaliações
                    </button>
                    <button 
                        class="tab-button" 
                        :class="{ active: activeTab === 'similar' }"
                        @click="activeTab = 'similar'"
                    >
                        Semelhantes
                    </button>
                </div>
                
                <!-- Overview Tab -->
                <div v-if="activeTab === 'overview'" class="tab-content">
                    <div class="section">
                        <h2>Sinopse</h2>
                        <p class="synopsis">{{ movie.description }}</p>
                    </div>
                    
                    <div class="section trailer-section" v-if="movie.trailer">
                        <h2>Trailer</h2>
                        <div class="trailer-container">
                            <iframe 
                                :src="movie.trailer" 
                                frameborder="0" 
                                allowfullscreen
                                class="trailer-frame"
                            ></iframe>
                        </div>
                    </div>
                    
                    <div class="section">
                        <h2>Onde Assistir</h2>
                        <div class="streaming-options">
                            <div v-for="service in movie.streamingServices" 
                                :key="service.name" 
                                class="streaming-service">
                                <img :src="service.logo" :alt="service.name" />
                                <span>{{ service.name }}</span>
                            </div>
                            <div v-if="!movie.streamingServices || movie.streamingServices.length === 0" class="no-streaming">
                                <i class="fas fa-sad-tear"></i>
                                <span>Não disponível em streaming no momento</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="section details-section">
                        <h2>Detalhes</h2>
                        <div class="details-grid">
                            <div class="detail-item">
                                <span class="label">Diretor:</span>
                                <span class="value">{{ movie.director }}</span>
                            </div>
                            <div class="detail-item">
                                <span class="label">País:</span>
                                <span class="value">{{ movie.country }}</span>
                            </div>
                            <div class="detail-item">
                                <span class="label">Idioma Original:</span>
                                <span class="value">{{ movie.language }}</span>
                            </div>
                            <div class="detail-item">
                                <span class="label">Orçamento:</span> <span class="value">{{ movie.budget ? `$${movie.budget.toLocaleString()}` : 'Não disponível' }}</span>
                                <span class="value">{{ movie.budget ? `$${movie.budget.toLocaleString()}` : 'Não disponível' }}</span>
                            </div>
                            <div class="detail-item">
                                <span class="label">Bilheteria:</span>
                                <span class="value">{{ movie.boxOffice ? `$${movie.boxOffice.toLocaleString()}` : 'Não disponível' }}</span>
                            </div>
                            <div class="detail-item">
                                <span class="label">Site Oficial:</span>
                                <a :href="movie.website" target="_blank" class="website-link" v-if="movie.website">Visitar site</a>
                                <span class="value" v-else>Não disponível</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Cast Tab -->
                <div v-if="activeTab === 'cast'" class="tab-content">
                    <div class="section">
                        <h2>Elenco Principal</h2>
                        <div class="cast-grid">
                            <div v-for="(actor, index) in movie.cast" :key="index" class="cast-member">
                                <div class="cast-photo-container">
                                    <img :src="getActorPhoto(actor)" :alt="actor.name" class="cast-photo" />
                                    <div class="cast-overlay">
                                        <div class="cast-info">
                                            <span class="cast-name">{{ actor.name }}</span>
                                            <span class="cast-character">{{ actor.character }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="section">
                        <h2>Equipe Técnica</h2>
                        <div class="crew-grid">
                            <div class="crew-member" v-if="movie.director">
                                <div class="crew-photo-container">
                                    <img :src="getCrewPhoto(movie.director)" :alt="movie.director.name" class="crew-photo" />
                                    <div class="crew-overlay">
                                        <div class="crew-info">
                                            <span class="crew-role">Direção</span>
                                            <span class="crew-name">{{ movie.director.name }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="crew-member" v-if="movie.writer">
                                <div class="crew-photo-container">
                                    <img :src="getCrewPhoto(movie.writer)" :alt="movie.writer.name" class="crew-photo" />
                                    <div class="crew-overlay">
                                        <div class="crew-info">
                                            <span class="crew-role">Roteiro</span>
                                            <span class="crew-name">{{ movie.writer.name }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="crew-member" v-if="movie.producer">
                                <div class="crew-photo-container">
                                    <img :src="getCrewPhoto(movie.producer)" :alt="movie.producer.name" class="crew-photo" />
                                    <div class="crew-overlay">
                                        <div class="crew-info">
                                            <span class="crew-role">Produção</span>
                                            <span class="crew-name">{{ movie.producer.name }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="crew-member" v-if="movie.cinematography">
                                <div class="crew-photo-container">
                                    <img :src="getCrewPhoto(movie.cinematography)" :alt="movie.cinematography.name" class="crew-photo" />
                                    <div class="crew-overlay">
                                        <div class="crew-info">
                                            <span class="crew-role">Fotografia</span>
                                            <span class="crew-name">{{ movie.cinematography.name }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="crew-member" v-if="movie.music">
                                <div class="crew-photo-container">
                                    <img :src="getCrewPhoto(movie.music)" :alt="movie.music.name" class="crew-photo" />
                                    <div class="crew-overlay">
                                        <div class="crew-info">
                                            <span class="crew-role">Música</span>
                                            <span class="crew-name">{{ movie.music.name }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Reviews Tab -->
                <div v-if="activeTab === 'reviews'" class="tab-content">
                    <div class="section">
                        <div class="section-header">
                            <h2>Avaliações dos Usuários</h2>
                            <button class="write-review-button">
                                <i class="fas fa-edit"></i> Escrever Avaliação
                            </button>
                        </div>
                        
                        <div class="reviews">
                            <div v-for="review in movie.reviews" :key="review.id" class="review-card">
                                <div class="review-header">
                                    <img :src="review.userAvatar" :alt="review.userName" class="reviewer-avatar" />
                                    <div class="reviewer-info">
                                        <span class="reviewer-name">{{ review.userName }}</span>
                                        <div class="review-rating">
                                            <i class="fas fa-star" v-for="n in review.rating" :key="n"></i>
                                            <i class="far fa-star" v-for="n in (5 - review.rating)" :key="n + 5"></i>
                                            <span class="review-date">{{ review.date || '1 semana atrás' }}</span>
                                        </div>
                                    </div>
                                </div>
                                <p class="review-text">{{ review.text }}</p>
                                <div class="review-actions">
                                    <button class="review-action-button">
                                        <i class="fas fa-thumbs-up"></i> Útil
                                    </button>
                                    <button class="review-action-button">
                                        <i class="fas fa-comment"></i> Comentar
                                    </button>
                                </div>
                            </div>
                            
                            <div v-if="!movie.reviews || movie.reviews.length === 0" class="no-reviews">
                                <i class="fas fa-comment-slash"></i>
                                <p>Ainda não há avaliações para este filme.</p>
                                <button class="write-review-button">Seja o primeiro a avaliar</button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Similar Movies Tab -->
                <div v-if="activeTab === 'similar'" class="tab-content">
                    <div class="section">
                        <h2>Filmes Semelhantes</h2>
                        
                        <div v-if="movie.similarMovies && movie.similarMovies.length > 0" class="similar-movies-grid">
                            <div v-for="similarMovie in movie.similarMovies" :key="similarMovie.id" class="similar-movie-card">
                                <img :src="similarMovie.poster" :alt="similarMovie.title" class="similar-movie-poster" />
                                <div class="similar-movie-overlay">
                                    <h3 class="similar-movie-title">{{ similarMovie.title }}</h3>
                                    <div class="similar-movie-meta">
                                        <span class="similar-movie-year">{{ similarMovie.year }}</span>
                                        <span class="similar-movie-rating">
                                            <i class="fas fa-star"></i> {{ similarMovie.rating }}
                                        </span>
                                    </div>
                                    <button class="view-movie-button" @click="goToMovie(similarMovie.id)">
                                        Ver Detalhes
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <div v-else class="no-similar-movies">
                            <i class="fas fa-film"></i>
                            <p>Nenhum filme semelhante encontrado.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'MovieDetails',
    props: {
        movie: {
            type: Object,
            required: true,
            default: () => ({
                cast: [
                    {
                        name: 'Robert Downey Jr.',
                        character: 'Tony Stark / Iron Man',
                        photo: 'https://m.media-amazon.com/images/M/MV5BNzg1MTUyNDYxOF5BMl5BanBnXkFtZTgwNTQ4MTE2MjE@._V1_UY317_CR12,0,214,317_AL_.jpg'
                    },
                    {
                        name: 'Chris Evans',
                        character: 'Steve Rogers / Captain America',
                        photo: 'https://m.media-amazon.com/images/M/MV5BMTU2NTg1OTQzMF5BMl5BanBnXkFtZTcwNjIyMjkyMg@@._V1_UY317_CR6,0,214,317_AL_.jpg'
                    },
                    {
                        name: 'Scarlett Johansson',
                        character: 'Natasha Romanoff / Black Widow',
                        photo: 'https://m.media-amazon.com/images/M/MV5BMTM3OTUwMDYwNl5BMl5BanBnXkFtZTcwNTUyNzc3Nw@@._V1_UY317_CR23,0,214,317_AL_.jpg'
                    }
                ],
                director: {
                    name: 'Anthony Russo',
                    photo: 'https://m.media-amazon.com/images/M/MV5BMTc2NjM5MTM0Ml5BMl5BanBnXkFtZTgwMTY3ODczNjM@._V1_UY317_CR10,0,214,317_AL_.jpg'
                }
            })
        }
    },
    data() {
        return {
            activeTab: 'overview',
            defaultActorPhoto: 'https://m.media-amazon.com/images/S/sash/N1QWYSqAfSJV62Y.png'
        }
    },
    methods: {
        startParty() {
            this.$emit('start-party', this.movie);
        },
        addToWatchlist() {
            this.$emit('add-to-watchlist', this.movie);
        },
        goToMovie(movieId) {
            this.$router.push(`/movie/${movieId}`);
        },
        getActorPhoto(actor) {
            return actor.photo || this.defaultActorPhoto;
        },
        getCrewPhoto(crewMember) {
            return crewMember.photo || this.defaultActorPhoto;
        }
    }
}
</script>

<style scoped>
.movie-details-container {
    position: relative;
    color: var(--text-color);
    background-color: var(--bg-color);
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

.backdrop {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 300px;
    background-size: cover;
    background-position: center;
    filter: blur(8px);
    z-index: -1;
}

.backdrop-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 300px;
    background: rgba(0, 0, 0, 0.5);
}

.movie-details {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    z-index: 1;
}

.movie-header {
    display: flex;
    gap: 2rem;
}

.poster-container {
    position: relative;
    width: 200px;
    flex-shrink: 0;
}

.movie-poster {
    width: 100%;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.rating-badge {
    position: absolute;
    bottom: 10px;
    right: 10px;
    background-color: var(--primary-color);
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    font-weight: bold;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.movie-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.movie-title {
    font-size: 2rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
}

.movie-meta {
    display: flex;
    gap: 1rem;
    font-size: 0.9rem;
    color: var(--secondary-text);
}

.genres {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-bottom: 1rem;
}

.genre-tag {
    background-color: var(--primary-color);
    color: white;
    padding: 0.3rem 0.6rem;
    border-radius: 8px;
    font-size: 0.8rem;
}

.movie-actions {
    display: flex;
    gap: 1rem;
}

.action-button {
    background-color: var(--primary-color);
    color: white;
    border: none;
    padding: 0.8rem 1.5rem;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background-color 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.action-button:hover {
    background-color: var(--primary-color-dark);
}

.tabs-container {
    margin-top: 2rem;
}

.tabs {
    display: flex;
    gap: 1rem;
    border-bottom: 2px solid var(--border-color);
    padding-bottom: 0.5rem;
}

.tab-button {
    background: none;
    border: none;
    color: var(--secondary-text);
    font-size: 1rem;
    cursor: pointer;
    padding: 0.5rem 1rem;
    transition: color 0.3s ease;
}

.tab-button.active {
    color: var(--primary-color);
    font-weight: bold;
    border-bottom: 2px solid var(--primary-color);
}

.tab-content {
    margin-top: 1.5rem;
}

.section {
    margin-bottom: 2rem;
}

.section h2 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: var(--text-color);
}

.synopsis {
    font-size: 1rem;
    line-height: 1.6;
    color: var(--text-color);
}

.trailer-section {
    position: relative;
    padding-top: 56.25%;
    /* 16:9 Aspect Ratio */
}

.trailer-container {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
}

.trailer-frame {
    width: 100%;
    height: 100%;
    border: none;
    border-radius: 8px;
}

.streaming-options {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
}

.streaming-service {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background-color: var(--card-bg);
    padding: 0.5rem 1rem;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.no-streaming {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--secondary-text);
}

.details-section {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 1rem;
}

.detail-item {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
}

.label {
    font-weight: bold;
    color: var(--text-color);
}

.value {
    color: var(--secondary-text);
}

.website-link {
    color: var(--primary-color);
    text-decoration: none;
    transition: color 0.3s ease;
}

.website-link:hover {
    color: var(--primary-color-dark);
}

.cast-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1.5rem;
    padding: 1rem 0;
}

.cast-member {
    position: relative;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease;
}

.cast-member:hover {
    transform: translateY(-5px);
}

.cast-photo-container {
    position: relative;
    width: 100%;
    padding-top: 150%; /* 2:3 aspect ratio */
    overflow: hidden;
}

.cast-photo {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
}

.cast-member:hover .cast-photo {
    transform: scale(1.05);
}

.cast-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
    padding: 1rem;
    color: white;
}

.cast-info {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
}

.cast-name {
    font-weight: 600;
    font-size: 1.1rem;
}

.cast-character {
    font-size: 0.9rem;
    opacity: 0.9;
}

.crew-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 2rem;
    padding: 1rem 0;
}

.crew-member {
    position: relative;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease;
}

.crew-member:hover {
    transform: translateY(-5px);
}

.crew-photo-container {
    position: relative;
    width: 100%;
    padding-top: 100%; /* 1:1 aspect ratio */
    overflow: hidden;
}

.crew-photo {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
}

.crew-member:hover .crew-photo {
    transform: scale(1.05);
}

.crew-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
    padding: 1rem;
    color: white;
}

.crew-info {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
}

.crew-role {
    font-size: 0.9rem;
    opacity: 0.9;
}

.crew-name {
    font-weight: 600;
    font-size: 1.1rem;
}

.reviews {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.review-card {
    background-color: var(--card-bg);
    padding: 1rem;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.review-header {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.reviewer-avatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    object-fit: cover;
}

.reviewer-info {
    display: flex;
    flex-direction: column;
}

.reviewer-name {
    font-weight: bold;
    color: var(--text-color);
}

.review-rating {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.9rem;
    color: var(--secondary-text);
}

.review-text {
    margin-top: 0.5rem;
    font-size: 0.95rem;
    line-height: 1.5;
    color: var(--text-color);
}

.review-actions {
    display: flex;
    gap: 1rem;
    margin-top: 0.5rem;
}

.review-action-button {
    background: none;
    border: none;
    color: var(--primary-color);
    cursor: pointer;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 0.3rem;
    transition: color 0.3s ease;
}

.review-action-button:hover {
    color: var(--primary-color-dark);
}

.no-reviews {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    color: var(--secondary-text);
}

.write-review-button {
    background-color: var(--primary-color);
    color: white;
    border: none;
    padding: 0.8rem 1.5rem;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background-color 0.3s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.write-review-button:hover {
    background-color: var(--primary-color-dark);
}

.similar-movies-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
}

.similar-movie-card {
    position: relative;
    overflow: hidden;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: transform 0.3s ease;
}

.similar-movie-card:hover {
    transform: translateY(-5px);
}

.similar-movie-poster {
    width: 100%;
    height: auto;
    display: block;
}

.similar-movie-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 0.5rem;
    text-align: center;
}

.similar-movie-title {
    font-size: 1rem;
    font-weight: bold;
}

.similar-movie-meta {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    font-size: 0.85rem;
}

.view-movie-button {
    background-color: var(--primary-color);
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.85rem;
    transition: background-color 0.3s ease;
    margin-top: 0.5rem;
}

.view-movie-button:hover {
    background-color: var(--primary-color-dark);
}

@media (max-width: 768px) {
    .movie-header {
        flex-direction: column;
        align-items: center;
        text-align: center;
    }

    .movie-info {
        align-items: center;
    }

    .movie-actions {
        justify-content: center;
    }

    .cast-grid {
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 1rem;
    }

    .crew-grid {
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 1rem;
    }

    .cast-name, .crew-name {
        font-size: 1rem;
    }

    .cast-character, .crew-role {
        font-size: 0.8rem;
    }
}

@media (max-width: 480px) {
    .movie-title {
        font-size: 1.5rem;
    }

    .action-button {
        padding: 0.5rem 1rem;
        font-size: 0.8rem;
    }

    .write-review-button {
        padding: 0.5rem 1rem;
        font-size: 0.8rem;
    }
}
</style> 