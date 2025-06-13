<template>
  <div class="profile-page">
    <!-- Profile Header -->
    <div class="profile-header">
      <div class="profile-cover">
        <img :src="coverPhoto" :alt="userName" class="cover-image">
        <div class="cover-overlay"></div>
        <div class="profile-avatar">
          <img :src="profilePhoto" :alt="userName">
          <button class="change-photo-btn" @click="triggerPhotoUpload" :disabled="isLoading">
            <i class="fas fa-camera"></i>
          </button>
          <input
            type="file"
            ref="photoInput"
            accept="image/*"
            @change="handlePhotoUpload"
            style="display: none"
          >
        </div>
      </div>
      <div class="profile-info">
        <h1>{{ userName }}</h1>
        <p class="join-date">Membro desde {{ joinDate }}</p>
        <div class="profile-bio">
          <textarea 
            v-if="isEditingBio" 
            v-model="bio" 
            placeholder="Conte um pouco sobre você..."
            @blur="saveBio"
          ></textarea>
          <p v-else @click="startBioEdit">{{ bio || 'Adicione uma biografia...' }}</p>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="profile-content">
      <!-- Left Sidebar -->
      <div class="profile-sidebar">
        <div class="profile-card">
          <h2>Estatísticas</h2>
          <div class="stats-grid">
            <div class="stat-box">
              <i class="fas fa-film"></i>
              <div class="stat-info">
                <span class="stat-value">{{ watchedMovies }}</span>
                <span class="stat-label">Filmes Assistidos</span>
              </div>
            </div>
            <div class="stat-box">
              <i class="fas fa-star"></i>
              <div class="stat-info">
                <span class="stat-value">{{ reviewCount }}</span>
                <span class="stat-label">Reviews</span>
              </div>
            </div>
            <div class="stat-box">
              <i class="fas fa-heart"></i>
              <div class="stat-info">
                <span class="stat-value">{{ favoriteMovies }}</span>
                <span class="stat-label">Favoritos</span>
              </div>
            </div>
            <div class="stat-box">
              <i class="fas fa-clock"></i>
              <div class="stat-info">
                <span class="stat-value">{{ watchTime }}h</span>
                <span class="stat-label">Tempo de Visualização</span>
              </div>
            </div>
            <div class="stat-box">
              <i class="fas fa-calendar-check"></i>
              <div class="stat-info">
                <span class="stat-value">{{ streakDays }}</span>
                <span class="stat-label">Dias Seguidos</span>
              </div>
            </div>
          </div>
        </div>

        <div class="profile-card">
          <h2>Conquistas</h2>
          <div class="achievements-list">
            <div v-for="achievement in achievements" :key="achievement.id" class="achievement-item">
              <div class="achievement-icon" :class="{ 'unlocked': achievement.unlocked }">
                <i :class="achievement.icon"></i>
              </div>
              <div class="achievement-details">
                <h3>{{ achievement.name }}</h3>
                <p class="achievement-description">{{ achievement.description }}</p>
                <div v-if="!achievement.unlocked" class="progress-bar">
                  <div class="progress" :style="{ width: `${achievement.progress}%` }"></div>
                </div>
                <span v-else class="unlocked-badge">
                  <i class="fas fa-check"></i> Desbloqueado
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="profile-main">
        <!-- Tabs Navigation -->
        <div class="tabs-nav">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            :class="['tab-btn', { active: activeTab === tab.id }]"
            @click="activeTab = tab.id"
          >
            <i :class="tab.icon"></i>
            {{ tab.name }}
          </button>
        </div>

        <!-- Tab Content -->
        <div class="tab-content">
          <!-- Personal Info Tab -->
          <div v-if="activeTab === 'personal'" class="profile-card">
            <h2>Informações Pessoais</h2>
            <div class="form-group">
              <label>Email</label>
              <div class="input-group">
                <input 
                  type="email" 
                  v-model="email"
                  :disabled="!isEditingEmail || isLoading"
                  placeholder="Seu email"
                >
                <button @click="toggleEmailEdit" class="edit-btn" :disabled="isLoading">
                  <i :class="['fas', isEditingEmail ? 'fa-check' : 'fa-pen']"></i>
                </button>
              </div>
              <div v-if="validationErrors.email" class="validation-error">
                {{ validationErrors.email }}
              </div>
            </div>

            <div class="form-group">
              <label>Senha</label>
              <div class="input-group">
                <input 
                  type="password" 
                  v-model="currentPassword"
                  :disabled="!isEditingPassword || isLoading"
                  placeholder="Sua senha atual"
                >
                <button @click="togglePasswordEdit" class="edit-btn" :disabled="isLoading">
                  <i :class="['fas', isEditingPassword ? 'fa-check' : 'fa-pen']"></i>
                </button>
              </div>
              <div v-if="isEditingPassword" class="password-fields">
                <input 
                  type="password" 
                  v-model="newPassword"
                  placeholder="Nova senha"
                  :disabled="isLoading"
                >
                <input 
                  type="password" 
                  v-model="confirmPassword"
                  placeholder="Confirmar nova senha"
                  :disabled="isLoading"
                >
                <div class="password-requirements">
                  <p>A senha deve conter:</p>
                  <ul>
                    <li :class="{ 'met': passwordStrength.length }">Pelo menos 8 caracteres</li>
                    <li :class="{ 'met': passwordStrength.uppercase }">Uma letra maiúscula</li>
                    <li :class="{ 'met': passwordStrength.lowercase }">Uma letra minúscula</li>
                    <li :class="{ 'met': passwordStrength.number }">Um número</li>
                    <li :class="{ 'met': passwordStrength.special }">Um caractere especial</li>
                  </ul>
                </div>
              </div>
              <div v-if="validationErrors.password" class="validation-error">
                {{ validationErrors.password }}
              </div>
            </div>
          </div>
          
          <!-- Favorites Tab -->
          <div v-if="activeTab === 'favorites'" class="profile-card">
            <div class="favorites-header">
              <h2>Meus Favoritos</h2>
              <div class="favorites-controls">
                <div class="search-box">
                  <i class="fas fa-search"></i>
                  <input 
                    type="text" 
                    v-model="searchQuery" 
                    placeholder="Buscar filmes..."
                    :disabled="isLoading"
                  >
                </div>
                <select v-model="sortBy" :disabled="isLoading">
                  <option value="date">Data Adicionado</option>
                  <option value="rating">Avaliação</option>
                  <option value="title">Título</option>
                </select>
              </div>
            </div>
            <div class="favorites-grid">
              <div v-for="movie in filteredAndSortedMovies" :key="movie.id" class="movie-card">
                <img :src="movie.poster" :alt="movie.title">
                <div class="movie-info">
                  <h3>{{ movie.title }}</h3>
                  <div class="movie-meta">
                    <span>{{ movie.year }}</span>
                    <span class="rating">
                      <i class="fas fa-star"></i>
                      {{ movie.rating }}
                    </span>
                  </div>
                  <p class="movie-date">Adicionado em {{ formatDate(movie.addedDate) }}</p>
                </div>
                <button class="remove-btn" @click="removeFavorite(movie.id)" :disabled="isLoading">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
            <div v-if="filteredAndSortedMovies.length === 0" class="empty-state">
              <i class="fas fa-heart-broken"></i>
              <p>Nenhum filme favorito encontrado</p>
            </div>
          </div>

          <!-- Preferences Tab -->
          <div v-if="activeTab === 'preferences'" class="profile-card">
            <h2>Preferências</h2>
            
            <div class="preferences-section">
              <h3>Gêneros Favoritos</h3>
              <div class="genres-grid">
                <button 
                  v-for="genre in availableGenres" 
                  :key="genre"
                  :class="['genre-btn', { active: favoriteGenres.includes(genre) }]"
                  @click="toggleGenre(genre)"
                  :disabled="isLoading"
                >
                  {{ genre }}
                </button>
              </div>
              <p class="genre-limit">Selecione até 5 gêneros favoritos</p>
            </div>

            <div class="preferences-section">
              <h3>Notificações</h3>
              <div class="notification-options">
                <div class="notification-option">
                  <div class="option-info">
                    <h4>Email</h4>
                    <p>Receba atualizações por email</p>
                  </div>
                  <label class="switch">
                    <input 
                      type="checkbox" 
                      v-model="emailNotifications"
                      :disabled="isLoading"
                    >
                    <span class="slider"></span>
                  </label>
                </div>
                <div class="notification-option">
                  <div class="option-info">
                    <h4>Novos Lançamentos</h4>
                    <p>Seja notificado sobre novos filmes</p>
                  </div>
                  <label class="switch">
                    <input 
                      type="checkbox" 
                      v-model="newReleaseNotifications"
                      :disabled="isLoading"
                    >
                    <span class="slider"></span>
                  </label>
                </div>
                <div class="notification-option">
                  <div class="option-info">
                    <h4>Recomendações Personalizadas</h4>
                    <p>Receba sugestões baseadas nos seus gostos</p>
                  </div>
                  <label class="switch">
                    <input 
                      type="checkbox" 
                      v-model="personalizedRecommendations"
                      :disabled="isLoading"
                    >
                    <span class="slider"></span>
                  </label>
                </div>
              </div>
            </div>

            <div class="preferences-section">
              <h3>Tema</h3>
              <div class="theme-options">
                <button 
                  v-for="theme in themes" 
                  :key="theme.id"
                  :class="['theme-btn', { active: currentTheme === theme.id }]"
                  @click="setTheme(theme.id)"
                  :disabled="isLoading"
                >
                  <i :class="theme.icon"></i>
                  {{ theme.name }}
                </button>
              </div>
              <div class="theme-customization">
                <h4>Personalização</h4>
                <div class="color-picker">
                  <label>Cor Principal</label>
                  <input 
                    type="color" 
                    v-model="primaryColor"
                    @change="updateThemeColors"
                  >
                </div>
                <div class="color-picker">
                  <label>Cor de Destaque</label>
                  <input 
                    type="color" 
                    v-model="accentColor"
                    @change="updateThemeColors"
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading Overlay -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>Carregando...</p>
    </div>

    <!-- Notifications -->
    <div v-if="notification" :class="['notification', notification.type]">
      {{ notification.message }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProfileView',
  data() {
    return {
      profilePhoto: require('@/assets/elonmusk.jpg'),
      coverPhoto: require('@/assets/cover.jpg'),
      userName: 'Law',
      joinDate: 'Janeiro 2024',
      bio: '',
      isEditingBio: false,
      watchedMovies: 42,
      reviewCount: 15,
      favoriteMovies: 23,
      watchTime: 156,
      streakDays: 7,
      email: 'luis@email.com',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      isEditingEmail: false,
      isEditingPassword: false,
      isLoading: false,
      activeTab: 'personal',
      favoriteGenres: [],
      availableGenres: [
        'Ação', 'Aventura', 'Comédia', 'Drama', 'Ficção Científica',
        'Terror', 'Romance', 'Animação', 'Documentário', 'Suspense'
      ],
      emailNotifications: true,
      newReleaseNotifications: true,
      personalizedRecommendations: true,
      currentTheme: 'light',
      primaryColor: '#2196f3',
      accentColor: '#ff4081',
      searchQuery: '',
      sortBy: 'date',
      validationErrors: {
        email: '',
        password: ''
      },
      notification: null,
      tabs: [
        { id: 'personal', name: 'Pessoal', icon: 'fas fa-user' },
        { id: 'favorites', name: 'Favoritos', icon: 'fas fa-heart' },
        { id: 'preferences', name: 'Preferências', icon: 'fas fa-cog' }
      ],
      themes: [
        { id: 'light', name: 'Claro', icon: 'fas fa-sun' },
        { id: 'dark', name: 'Escuro', icon: 'fas fa-moon' },
        { id: 'system', name: 'Sistema', icon: 'fas fa-desktop' }
      ],
      achievements: [
        {
          id: 1,
          name: 'Cinéfilo',
          icon: 'fas fa-film',
          description: 'Assista 50 filmes',
          unlocked: true,
          progress: 100
        },
        {
          id: 2,
          name: 'Crítico',
          icon: 'fas fa-star',
          description: 'Faça 20 reviews',
          unlocked: false,
          progress: 75
        },
        {
          id: 3,
          name: 'Maratonista',
          icon: 'fas fa-running',
          description: 'Assista filmes por 7 dias seguidos',
          unlocked: false,
          progress: 45
        },
        {
          id: 4,
          name: 'Colecionador',
          icon: 'fas fa-trophy',
          description: 'Adicione 100 filmes aos favoritos',
          unlocked: false,
          progress: 23
        }
      ]
    }
  },
  computed: {
    passwordStrength() {
      return {
        length: this.newPassword.length >= 8,
        uppercase: /[A-Z]/.test(this.newPassword),
        lowercase: /[a-z]/.test(this.newPassword),
        number: /[0-9]/.test(this.newPassword),
        special: /[!@#$%^&*]/.test(this.newPassword)
      }
    },
    filteredAndSortedMovies() {
      let movies = this.favoriteMovies;
      
      // Filter by search query
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        movies = movies.filter(movie => 
          movie.title.toLowerCase().includes(query)
        );
      }
      
      // Sort movies
      switch (this.sortBy) {
        case 'date':
          movies.sort((a, b) => new Date(b.addedDate) - new Date(a.addedDate));
          break;
        case 'rating':
          movies.sort((a, b) => b.rating - a.rating);
          break;
        case 'title':
          movies.sort((a, b) => a.title.localeCompare(b.title));
          break;
      }
      
      return movies;
    }
  },
  methods: {
    showNotification(message, type = 'success') {
      this.notification = { message, type };
      setTimeout(() => {
        this.notification = null;
      }, 3000);
    },
    triggerPhotoUpload() {
      this.$refs.photoInput.click();
    },
    async handlePhotoUpload(event) {
      const file = event.target.files[0];
      if (file) {
        try {
          this.isLoading = true;
          const reader = new FileReader();
          reader.onload = async (e) => {
            this.profilePhoto = e.target.result;
            // await userService.updateProfile({ photo: e.target.result });
            this.showNotification('Foto de perfil atualizada com sucesso!');
          };
          reader.readAsDataURL(file);
        } catch (error) {
          this.showNotification('Erro ao atualizar foto de perfil', 'error');
        } finally {
          this.isLoading = false;
        }
      }
    },
    toggleEmailEdit() {
      if (this.isEditingEmail) {
        this.saveEmail();
      } else {
        this.isEditingEmail = true;
      }
    },
    async saveEmail() {
      try {
        this.isLoading = true;
        this.validateEmail();
        if (this.validationErrors.email) {
          return;
        }
        // await userService.updateProfile({ email: this.email });
        this.isEditingEmail = false;
        this.showNotification('Email atualizado com sucesso!');
      } catch (error) {
        this.showNotification('Erro ao atualizar email', 'error');
      } finally {
        this.isLoading = false;
      }
    },
    togglePasswordEdit() {
      if (this.isEditingPassword) {
        this.savePassword();
      } else {
        this.isEditingPassword = true;
      }
    },
    async savePassword() {
      try {
        this.isLoading = true;
        this.validatePassword();
        if (this.validationErrors.password) {
          return;
        }
        // await userService.updatePassword({
        //   currentPassword: this.currentPassword,
        //   newPassword: this.newPassword
        // });
        this.isEditingPassword = false;
        this.newPassword = '';
        this.confirmPassword = '';
        this.showNotification('Senha atualizada com sucesso!');
      } catch (error) {
        this.showNotification('Erro ao atualizar senha', 'error');
      } finally {
        this.isLoading = false;
      }
    },
    validateEmail() {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.email)) {
        this.validationErrors.email = 'Email inválido';
      } else {
        this.validationErrors.email = '';
      }
    },
    validatePassword() {
      if (this.newPassword !== this.confirmPassword) {
        this.validationErrors.password = 'As senhas não coincidem';
        return;
      }
      if (!this.passwordStrength.length) {
        this.validationErrors.password = 'A senha deve ter pelo menos 8 caracteres';
        return;
      }
      if (!this.passwordStrength.uppercase) {
        this.validationErrors.password = 'A senha deve conter uma letra maiúscula';
        return;
      }
      if (!this.passwordStrength.lowercase) {
        this.validationErrors.password = 'A senha deve conter uma letra minúscula';
        return;
      }
      if (!this.passwordStrength.number) {
        this.validationErrors.password = 'A senha deve conter um número';
        return;
      }
      if (!this.passwordStrength.special) {
        this.validationErrors.password = 'A senha deve conter um caractere especial';
        return;
      }
      this.validationErrors.password = '';
    },
    async toggleGenre(genre) {
      try {
        this.isLoading = true;
        const index = this.favoriteGenres.indexOf(genre);
        if (index === -1) {
          if (this.favoriteGenres.length >= 5) {
            this.showNotification('Você pode selecionar no máximo 5 gêneros favoritos', 'error');
            return;
          }
          this.favoriteGenres.push(genre);
          // await userService.updateFavoriteGenres(this.favoriteGenres);
          this.showNotification('Gênero adicionado aos favoritos!');
        } else {
          this.favoriteGenres.splice(index, 1);
          // await userService.updateFavoriteGenres(this.favoriteGenres);
          this.showNotification('Gênero removido dos favoritos!');
        }
      } catch (error) {
        this.showNotification('Erro ao atualizar gêneros', 'error');
      } finally {
        this.isLoading = false;
      }
    },
    async removeFavorite(movieId) {
      try {
        this.isLoading = true;
        // await userService.removeFavoriteMovie(movieId);
        this.favoriteMovies = this.favoriteMovies.filter(movie => movie.id !== movieId);
        this.showNotification('Filme removido dos favoritos!');
      } catch (error) {
        this.showNotification('Erro ao remover filme', 'error');
      } finally {
        this.isLoading = false;
      }
    },
    setTheme(theme) {
      this.currentTheme = theme;
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
    },
    updateThemeColors() {
      document.documentElement.style.setProperty('--primary-color', this.primaryColor);
      document.documentElement.style.setProperty('--accent-color', this.accentColor);
      localStorage.setItem('primaryColor', this.primaryColor);
      localStorage.setItem('accentColor', this.accentColor);
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  },
  created() {
    // Load saved theme and colors
    const savedTheme = localStorage.getItem('theme') || 'light';
    const savedPrimaryColor = localStorage.getItem('primaryColor') || '#2196f3';
    const savedAccentColor = localStorage.getItem('accentColor') || '#ff4081';
    
    this.currentTheme = savedTheme;
    this.primaryColor = savedPrimaryColor;
    this.accentColor = savedAccentColor;
    
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.documentElement.style.setProperty('--primary-color', savedPrimaryColor);
    document.documentElement.style.setProperty('--accent-color', savedAccentColor);
  }
}
</script>

<style scoped>
/* Global styling */
.profile-page {
  min-height: 100vh;
  background-color: var(--bg-color);
  color: var(--text-color);
  padding: 1rem;
  font-family: 'Poppins', sans-serif;
}

/* Header section styling */
.profile-header {
  background-color: var(--card-bg);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  max-width: 1100px;
  margin: 0 auto 2rem;
  width: 100%;
  position: relative;
  transition: all 0.3s ease;
}

.profile-header:hover .cover-image {
  transform: scale(1.05);
}

.profile-cover {
  position: relative;
  height: 300px;
  overflow: hidden;
  border-radius: 20px 20px 0 0;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.cover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.7) 100%);
  pointer-events: none;
}

.profile-avatar {
  position: relative;
  margin-top: -75px;
  margin-left: 2rem;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid var(--background-dark);
  background: var(--background-dark);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  z-index: 2;
}

.profile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  transition: transform 0.3s ease;
}

.profile-avatar:hover img {
  transform: scale(1.05);
}

.change-photo-btn {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  opacity: 0;
}

.profile-avatar:hover .change-photo-btn {
  opacity: 1;
}

.change-photo-btn:hover {
  background: var(--primary-color);
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.change-photo-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: rgba(0, 0, 0, 0.5);
}

.change-photo-btn i {
  font-size: 14px;
}

.profile-info {
  padding: 70px 50px 30px;
  position: relative;
  background: linear-gradient(to top, var(--card-bg) 80%, transparent);
}

.profile-info h1 {
  margin: 0 0 5px;
  font-size: 2.2rem;
  font-weight: 700;
  color: var(--heading-color);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.profile-info h1::after {
  content: '✓';
  font-size: 1rem;
  background: var(--primary-color);
  color: white;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.join-date {
  color: var(--secondary-text);
  font-size: 0.95rem;
  margin: 0 0 15px;
  display: flex;
  align-items: center;
  opacity: 0.8;
  transition: opacity 0.3s ease;
}

.join-date:hover {
  opacity: 1;
}

.profile-bio {
  max-width: 600px;
  margin-top: 15px;
  position: relative;
  transition: all 0.3s ease;
}

.profile-bio textarea {
  width: 100%;
  min-height: 100px;
  padding: 12px 15px;
  border: 2px solid transparent;
  border-radius: 8px;
  background: var(--bg-color);
  color: var(--text-color);
  resize: vertical;
  font-family: inherit;
  font-size: 0.95rem;
  line-height: 1.5;
  transition: all 0.3s ease;
}

.profile-bio textarea:focus {
  border-color: var(--primary-color);
  outline: none;
  box-shadow: 0 0 0 4px rgba(var(--primary-rgb), 0.1);
  transform: translateY(-2px);
}

.profile-bio p {
  margin: 0;
  cursor: pointer;
  padding: 12px 15px;
  border-radius: 8px;
  transition: all 0.3s ease;
  font-size: 0.95rem;
  line-height: 1.5;
  color: var(--text-color);
  border: 2px solid transparent;
}

.profile-bio p:hover {
  background: var(--hover-bg);
  border-color: var(--border-color);
  transform: translateY(-2px);
}

/* Content layout */
.profile-content {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 1.5rem;
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (max-width: 992px) {
  .profile-content {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 0 0.5rem;
  }

  .profile-sidebar {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1rem;
  }

  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 0.75rem;
  }
}

@media (max-width: 480px) {
  .profile-content {
    padding: 0;
  }

  .profile-sidebar {
    grid-template-columns: 1fr;
  }

  .profile-card {
    margin-bottom: 1rem;
    border-radius: 8px;
  }
}

/* Card styling */
.profile-card {
  background-color: var(--card-bg);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.profile-card h2 {
  font-size: 1.4rem;
  margin: 0 0 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border-color);
  font-weight: 600;
  color: var(--heading-color);
}

.profile-card h3 {
  font-size: 1.1rem;
  margin: 0 0 1rem;
  font-weight: 600;
  color: var(--heading-color);
}

/* Stats section */
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem 0.75rem;
}

.stat-box {
  display: flex;
  align-items: center;
  padding: 1.2rem;
  background: linear-gradient(145deg, var(--bg-color), var(--card-bg));
  border-radius: 12px;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  position: relative;
  overflow: hidden;
}

.stat-box::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, transparent, rgba(var(--primary-rgb), 0.1), transparent);
  transform: translateX(-100%);
  transition: transform 0.6s ease;
}

.stat-box:hover::before {
  transform: translateX(100%);
}

.stat-box:hover {
  transform: translateY(-5px);
  border-color: var(--primary-color);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.stat-box i {
  font-size: 1.6rem;
  color: var(--primary-color);
  margin-right: 1.2rem;
  width: 32px;
  text-align: center;
  transition: all 0.3s ease;
}

.stat-box:hover i {
  transform: scale(1.2);
}

.stat-info {
  flex-grow: 1;
}

.stat-value {
  display: block;
  font-size: 1.4rem;
  font-weight: 700;
  line-height: 1.2;
  color: var(--heading-color);
}

.stat-label {
  font-size: 0.85rem;
  color: var(--secondary-text);
}

/* Achievements section */
.achievements-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.achievement-item {
  display: flex;
  gap: 1.2rem;
  padding: 1.2rem;
  background: linear-gradient(145deg, var(--bg-color), var(--card-bg));
  border-radius: 12px;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  position: relative;
  overflow: hidden;
}

.achievement-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, transparent, rgba(var(--primary-rgb), 0.1), transparent);
  transform: translateX(-100%);
  transition: transform 0.6s ease;
}

.achievement-item:hover::before {
  transform: translateX(100%);
}

.achievement-item:hover {
  transform: translateY(-5px);
  border-color: var(--primary-color);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.achievement-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(145deg, var(--bg-color), var(--card-bg));
  color: var(--secondary-text);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-size: 1.3rem;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.achievement-icon.unlocked {
  background: linear-gradient(145deg, rgba(76, 175, 80, 0.1), rgba(76, 175, 80, 0.2));
  color: #4CAF50;
  border-color: rgba(76, 175, 80, 0.3);
}

.achievement-item:hover .achievement-icon {
  transform: scale(1.1) rotate(5deg);
}

.achievement-details {
  flex: 1;
}

.achievement-details h3 {
  font-size: 1rem;
  margin: 0 0 0.3rem;
  font-weight: 600;
}

.achievement-details p {
  margin: 0 0 0.5rem;
  font-size: 0.85rem;
  color: var(--secondary-text);
}

.progress-bar {
  height: 6px;
  background-color: var(--border-color);
  border-radius: 3px;
  overflow: hidden;
  margin-top: 0.8rem;
  position: relative;
}

.progress {
  height: 100%;
  background: linear-gradient(to right, var(--primary-color), var(--secondary-color));
  border-radius: 3px;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.progress::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, 
    rgba(255,255,255,0) 0%,
    rgba(255,255,255,0.2) 50%,
    rgba(255,255,255,0) 100%);
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.unlocked-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.85rem;
  color: #4CAF50;
  background-color: rgba(76, 175, 80, 0.1);
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
}

/* Tabs navigation */
.tabs-nav {
  display: flex;
  margin-bottom: 1.5rem;
  background-color: var(--card-bg);
  border-radius: 12px;
  padding: 0.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow-x: auto;
}

.tab-btn {
  padding: 0.8rem 1.2rem;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--secondary-text);
  font-weight: 500;
  font-size: 0.95rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: max-content;
}

.tab-btn i {
  font-size: 1.1rem;
}

.tab-btn:hover {
  color: var(--primary-color);
  background-color: var(--hover-bg);
}

.tab-btn.active {
  color: var(--primary-color);
  background-color: var(--hover-bg);
  font-weight: 600;
}

/* Form elements */
.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--heading-color);
}

.input-group {
  display: flex;
  align-items: center;
}

.input-group input {
  flex: 1;
  padding: 0.8rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--bg-color);
  color: var(--text-color);
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

.input-group input:focus {
  border-color: var(--primary-color);
  outline: none;
  box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.1);
}

.edit-btn {
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  margin-left: 0.5rem;
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--secondary-text);
}

.edit-btn:hover {
  background-color: var(--hover-bg);
  color: var(--primary-color);
}

.password-fields {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}

.validation-error {
  color: #f44336;
  font-size: 0.85rem;
  margin-top: 0.5rem;
}

.password-requirements {
  margin-top: 1rem;
  padding: 1rem;
  background: var(--bg-color);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.password-requirements p {
  margin: 0 0 0.5rem;
  font-weight: 500;
  font-size: 0.9rem;
}

.password-requirements ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.password-requirements li {
  font-size: 0.85rem;
  color: var(--secondary-text);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.3rem;
  padding-left: 1rem;
  position: relative;
}

.password-requirements li::before {
  content: "•";
  position: absolute;
  left: 0;
}

.password-requirements li.met {
  color: #4caf50;
}

.password-requirements li.met::before {
  content: "✓";
}

/* Favorites section */
.favorites-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.favorites-controls {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-box i {
  position: absolute;
  left: 12px;
  color: var(--secondary-text);
  pointer-events: none;
}

.search-box input {
  padding: 0.6rem 0.8rem 0.6rem 2.2rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-color);
  color: var(--text-color);
  min-width: 200px;
  transition: all 0.2s ease;
}

.search-box input:focus {
  border-color: var(--primary-color);
  outline: none;
  box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.1);
}

.favorites-controls select {
  padding: 0.6rem 0.8rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-color);
  color: var(--text-color);
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 140px;
}

.favorites-controls select:focus {
  border-color: var(--primary-color);
  outline: none;
}

.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1.5rem;
}

@media (max-width: 480px) {
  .favorites-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 1rem;
  }
}

.movie-card {
  background-color: var(--bg-color);
  border-radius: 10px;
  overflow: hidden;
  position: relative;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.movie-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.movie-card img {
  width: 100%;
  aspect-ratio: 2/3;
  object-fit: cover;
  border-radius: 10px 10px 0 0;
}

.movie-info {
  padding: 0.75rem;
}

.movie-info h3 {
  margin: 0 0 0.3rem;
  font-size: 0.95rem;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.movie-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: var(--secondary-text);
}

.rating {
  display: flex;
  align-items: center;
  gap: 0.2rem;
  color: #FFC107;
}

.movie-date {
  font-size: 0.75rem;
  color: var(--secondary-text);
  margin: 0.5rem 0 0;
}

.remove-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s ease, background-color 0.2s ease;
}

.movie-card:hover .remove-btn {
  opacity: 1;
}

.remove-btn:hover {
  background-color: rgba(244, 67, 54, 0.9);
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--secondary-text);
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state p {
  font-size: 1.1rem;
  margin: 0;
}

/* Genres section */
.genres-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 0.75rem;
}

.genre-btn {
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.genre-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.genre-btn.active {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.genre-limit {
  font-size: 0.85rem;
  color: var(--secondary-text);
  margin: 0.75rem 0 0;
  text-align: center;
}

/* Notifications section */
.notification-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.notification-option {
  display: flex;
  align-items: center;
  padding: 1rem;
  background-color: var(--bg-color);
  border-radius: 10px;
  justify-content: space-between;
}

.option-info h4 {
  margin: 0 0 0.2rem;
  font-size: 1rem;
  font-weight: 500;
}

.option-info p {
  margin: 0;
  font-size: 0.85rem;
  color: var(--secondary-text);
}

/* Switch styling */
.switch {
  position: relative;
  display: inline-block;
  width: 46px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--border-color);
  transition: .3s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .3s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: var(--primary-color);
}

input:checked + .slider:before {
  transform: translateX(22px);
}

/* Theme section */
.theme-options {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.theme-btn {
  flex: 1;
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.theme-btn i {
  font-size: 1.5rem;
  color: var(--secondary-text);
  margin-bottom: 0.3rem;
}

.theme-btn:hover {
  border-color: var(--primary-color);
}

.theme-btn.active {
  border-color: var(--primary-color);
  background-color: rgba(33, 150, 243, 0.05);
}

.theme-btn.active i {
  color: var(--primary-color);
}

.theme-customization {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
}

.color-picker {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 0.75rem;
}

.color-picker label {
  flex: 1;
  font-size: 0.95rem;
  font-weight: 500;
}

.color-picker input[type="color"] {
  width: 36px;
  height: 36px;
  padding: 0;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  background: none;
}

/* Loading and notifications */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  color: white;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.notification {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  padding: 1rem 1.5rem;
  border-radius: 10px;
  color: white;
  font-weight: 500;
  z-index: 1000;
  animation: slideIn 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  max-width: 350px;
}

.notification.success {
  background: linear-gradient(135deg, #4CAF50, #2E7D32);
}

.notification.success::before {
  content: "\f00c";
  font-family: "Font Awesome 5 Free";
  font-weight: 900;
  margin-right: 0.75rem;
}

.notification.error {
  background: linear-gradient(135deg, #F44336, #C62828);
}

.notification.error::before {
  content: "\f071";
  font-family: "Font Awesome 5 Free";
  font-weight: 900;
  margin-right: 0.75rem;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* States styling */
button:disabled, input:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .favorites-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .favorites-controls {
    width: 100%;
  }
  
  .search-box, .favorites-controls select {
    flex: 1;
  }
  
  .profile-card {
    padding: 1.25rem;
  }
  
  .theme-options {
    flex-wrap: wrap;
  }
  
  .notification {
    left: 1rem;
    right: 1rem;
    bottom: 1rem;
    max-width: none;
  }
}
</style> 