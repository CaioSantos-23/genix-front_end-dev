<template>
  <div class="usuario-view">
    <!-- Loading Overlay -->
    <div v-if="isLoading" class="loading-overlay" role="status">
      <div class="loading-spinner" aria-hidden="true"></div>
      <p>Carregando seu perfil...</p>
    </div>

    <main id="main-content" class="profile-content" :class="{ 'is-loading': isLoading }">
      <!-- Profile Header -->
      <ProfileHeader
        :user="user"
        :watched-movies="watchedMovies"
        :total-reviews="totalReviews"
        :total-lists="totalLists"
        :member-since="memberSince"
        :last-active="lastActive"
        :is-loading="isSaving"
        @photo-upload="handlePhotoUpload"
        @error="handleError"
      />

      <div class="profile-grid">
        <!-- Account Section -->
        <div class="profile-section">
          <div class="section-header">
            <h3>
              <i class="fas fa-user"></i>
              Conta
            </h3>
            <p class="section-description">Gerencie suas informações pessoais</p>
          </div>
          <PersonalInfoSection
            :email="user.email"
            :email-editing-enabled="emailEditingEnabled"
            :current-password="currentPassword"
            :new-password="newPassword"
            :confirm-password="confirmPassword"
            :password-editing-enabled="passwordEditingEnabled"
            :is-loading="isSaving"
            @save-email="handleEmailSave"
            @save-password="handlePasswordSave"
            @toggle-email-edit="toggleEmailEdit"
            @start-password-edit="startPasswordEdit"
            @cancel-password-edit="cancelPasswordEdit"
            @error="handleError"
          />
        </div>

        <!-- Preferences Section -->
        <div class="preferences-section">
          <div class="section-header">
            <h3>
              <i class="fas fa-cog"></i>
              Preferências
            </h3>
            <p class="section-description">Personalize sua experiência no Genix</p>
          </div>

          <div class="preferences-grid">
            <!-- Theme Preference -->
            <div class="preference-item">
              <div class="preference-header">
                <i :class="isDarkMode ? 'fas fa-moon' : 'fas fa-sun'"></i>
                <h4>{{ isDarkMode ? 'Modo Escuro' : 'Modo Claro' }}</h4>
              </div>
              <p class="preference-description">
                {{ isDarkMode ? 'Desative o tema escuro para uma experiência mais clara' : 'Ative o tema escuro para uma experiência mais confortável' }}
              </p>
              <div class="toggle-switch">
                <input
                  type="checkbox"
                  id="dark-mode"
                  v-model="isDarkMode"
                  @change="handleDarkModeToggle"
                  role="switch"
                  :aria-label="isDarkMode ? 'Desativar modo escuro' : 'Ativar modo escuro'"
                  :disabled="isSaving"
                />
                <label for="dark-mode" class="toggle-slider">
                  <span class="sr-only">{{ isDarkMode ? 'Desativar modo escuro' : 'Ativar modo escuro' }}</span>
                </label>
              </div>
            </div>

            <!-- Notifications Preference -->
            <div class="preference-item">
              <div class="preference-header">
                <i class="fas fa-bell"></i>
                <h4>Notificações</h4>
              </div>
              <p class="preference-description">Receba atualizações sobre seus filmes favoritos</p>
              <div class="toggle-switch">
                <input
                  type="checkbox"
                  id="notifications"
                  v-model="notifications"
                  @change="handleNotificationToggle"
                  role="switch"
                  :aria-label="notifications ? 'Desativar notificações' : 'Ativar notificações'"
                  :disabled="isSaving"
                />
                <label for="notifications" class="toggle-slider">
                  <span class="sr-only">{{ notifications ? 'Desativar notificações' : 'Ativar notificações' }}</span>
                </label>
              </div>
            </div>

            <!-- Language Preference -->
            <div class="preference-item">
              <div class="preference-header">
                <i class="fas fa-globe"></i>
                <h4>Idioma</h4>
              </div>
              <p class="preference-description">Escolha o idioma da interface</p>
              <select
                v-model="language"
                @change="handleLanguageChange"
                class="language-select"
                aria-label="Selecionar idioma"
                :disabled="isSaving"
              >
                <option value="pt-BR">Português (Brasil)</option>
                <option value="en-US">English (US)</option>
                <option value="es-ES">Español</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Genres Section -->
        <div class="genres-section">
          <div class="section-header">
            <h3>
              <i class="fas fa-film"></i>
              Gêneros Favoritos
            </h3>
            <p class="section-description">Escolha seus gêneros de filmes preferidos</p>
          </div>
          <FavoriteGenresSection
            :available-genres="availableGenres"
            :favorite-genres="selectedGenres"
            :is-loading="isSaving"
            @genre-toggled="handleGenreToggle"
          />
        </div>

        <!-- 👇 NOVA SEÇÃO PARA FILMES FAVORITOS 👇 -->
        <div class="profile-section favorite-movies-section">
            <div class="section-header">
                <h3>
                    <i class="fas fa-heart"></i>
                    Filmes Favoritos
                </h3>
                <p class="section-description">Sua lista de filmes curtidos</p>
            </div>
            <div v-if="isLoadingFavorites" class="loading-favorites">
                <div class="spinner"></div> Carregando favoritos...
            </div>
            <div v-else-if="favoriteMoviesError" class="error-message-inline">
                {{ favoriteMoviesError }}
            </div>
            <div v-else-if="userFavoriteMovies && userFavoriteMovies.length > 0" class="movies-grid-favorites">
                <MovieCard
                    v-for="movie in userFavoriteMovies"
                    :key="movie.apiMovieId"
                    :movie="movie"
                />
                <!-- MovieCard precisa ser capaz de lidar com o objeto de filme formatado pelo seu backend -->
            </div>
            <div v-else class="no-results-inline">
                <p>Você ainda não adicionou nenhum filme aos favoritos.</p>
            </div>
        </div>

        <!-- Account Actions Section -->
        <div class="account-actions-section">
          <div class="section-header">
            <h3>
              <i class="fas fa-shield-alt"></i>
              Ações da Conta
            </h3>
            <p class="section-description">Gerencie sua conta Genix</p>
          </div>
          
          <div class="account-actions-grid">
            <div class="action-item logout-section">
              <div class="action-header">
                <i class="fas fa-sign-out-alt"></i>
                <h4>Sair da Conta</h4>
              </div>
              <p class="action-description">Fazer logout da sua conta Genix</p>
              <button 
                class="logout-button" 
                @click="handleLogout"
                :disabled="isSaving"
              >
                <i class="fas fa-sign-out-alt"></i>
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Success Message -->
    <transition name="fade">
      <div 
        v-if="showSuccessMessage" 
        class="success-message"
        role="alert"
      >
        <i class="fas fa-check-circle"></i>
        <span>{{ successMessage }}</span>
      </div>
    </transition>

    <!-- Error Message -->
    <transition name="fade">
      <div 
        v-if="showErrorMessage" 
        class="error-message"
        role="alert"
      >
        <i class="fas fa-exclamation-circle"></i>
        <span>{{ errorMessage }}</span>
      </div>
    </transition>
  </div>
</template>

<script>
import ProfileHeader from '@/components/ProfileHeader.vue';
import PersonalInfoSection from '@/components/PersonalInfoSection.vue';
import FavoriteGenresSection from '@/components/FavoriteGenresSection.vue';
import MovieCard from '@/components/MovieCard.vue';
import { userService } from '@/services/userService'; // MANTENHA ESTA
import MovieService from '@/services/MovieService';
import { useThemeStore } from '@/stores/themeStore';
import { storeToRefs } from 'pinia';

export default {
  name: 'UsuarioView',
  components: {
    ProfileHeader,
    PersonalInfoSection,
    FavoriteGenresSection,
    MovieCard
  },
  setup() {
    const themeStore = useThemeStore();
    const { isDarkMode } = storeToRefs(themeStore);
    
    return { themeStore, isDarkMode };
  },
  data() {
    return {
      user: {
        name: '',
        email: '',
        photo: null, // Virá do backend
        favoriteGenres: [], // Virá do backend
        createdAt: null // Virá do backend
      },
      watchedMovies: 0, // Estes dados precisarão vir do backend ou serem calculados
      totalReviews: 0,
      totalLists: 0,
      memberSince: '', // Será formatado a partir de user.createdAt
      lastActive: '',  // Precisaria de um campo/lógica no backend
      emailEditingEnabled: false,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      passwordEditingEnabled: false,
      selectedGenres: [], // Será this.user.favoriteGenres
      availableGenres: [
        { id: 1, name: 'Ação' }, { id: 2, name: 'Aventura' }, { id: 3, name: 'Comédia' },
        { id: 4, name: 'Drama' }, { id: 5, name: 'Ficção Científica' }, { id: 6, name: 'Terror' },
        { id: 7, name: 'Romance' }, { id: 8, name: 'Animação' }, { id: 9, name: 'Documentário' },
        { id: 10, name: 'Suspense' }, { id: 11, name: 'Crime' }, { id: 12, name: 'Família' },
        { id: 13, name: 'Fantasia' }, { id: 14, name: 'História' }, { id: 15, name: 'Música' },
        { id: 16, name: 'Mistério' }, { id: 17, name: 'Guerra' }, { id: 18, name: 'Western' }
      ],
      notifications: true,
      language: 'pt-BR',
      isLoading: true, // Para o carregamento inicial da página
      isSaving: false,  // Para operações de salvar (update de perfil, etc.)
      showSuccessMessage: false, // Para controlar mensagens de sucesso/erro
      showErrorMessage: false,
      successMessage: '',
      errorMessage: '', // Erro geral da página
      userFavoriteMovies: [],
      isLoadingFavorites: false,
      favoriteMoviesError: null
    };
  },
  async created() {
    this.isLoading = true;
    try {
      await this.fetchUserData();
      await this.fetchUserFavoriteMovies(); // Busca os filmes favoritos
      this.initializePreferences();
    } catch (error) {
      this.handleError(error.message || 'Erro ao carregar dados da página de usuário');
    } finally {
      this.isLoading = false;
    }
  },
  methods: {
    async fetchUserData() {
      try {
        console.log("[UsuarioView] Buscando dados do perfil do usuário...");
        const userDataFromServer = await userService.getUserProfile();
        console.log("[UsuarioView] Dados do usuário recebidos:", JSON.parse(JSON.stringify(userDataFromServer)));

        if (userDataFromServer && (userDataFromServer.id || userDataFromServer._id)) {
          this.user = { ...userDataFromServer }; // Cria uma cópia para evitar mutação direta do objeto de resposta

          // CORREÇÃO PRINCIPAL AQUI:
          // Popula this.selectedGenres com os IDs dos gêneros favoritos do usuário
          // que EXISTEM na sua lista this.availableGenres.
          // Assumimos que this.user.favoriteGenres (do backend) é um array de IDs.
          if (this.user.favoriteGenres && Array.isArray(this.user.favoriteGenres)) {
            const availableGenreIds = this.availableGenres.map(g => g.id);
            this.selectedGenres = this.user.favoriteGenres.filter(favGenreId => 
                availableGenreIds.includes(favGenreId)
            );
          } else {
            this.selectedGenres = []; // Se não vier nada ou não for array, começa vazio
          }
          console.log("[UsuarioView] selectedGenres inicializado com:", JSON.parse(JSON.stringify(this.selectedGenres)));

          this.memberSince = this.user.createdAt ? new Date(this.user.createdAt).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long' }) : 'Data indisponível';
          this.watchedMovies = Math.floor(Math.random() * 100);
          this.totalReviews = Math.floor(Math.random() * 30);
          this.totalLists = Math.floor(Math.random() * 5);
          this.lastActive = "Hoje";
        } else {
          throw new Error("Dados do usuário inválidos ou sem ID recebidos do servidor.");
        }
      } catch (error) {
        console.error('Falha ao carregar dados do usuário em UsuarioView:', error);
        this.handleError(error.message || 'Falha ao carregar dados do perfil.');
      }
    },
    async fetchUserFavoriteMovies() {
        this.isLoadingFavorites = true;
        this.favoriteMoviesError = null;
        try {
            this.userFavoriteMovies = await MovieService.getFavoriteMovies();
            console.log("[UsuarioView] Filmes favoritos carregados:", this.userFavoriteMovies);
        } catch (error) {
            console.error("Erro ao buscar filmes favoritos do usuário:", error);
            this.favoriteMoviesError = error.message || "Não foi possível carregar seus filmes favoritos.";
            this.userFavoriteMovies = [];
            this.handleError(this.favoriteMoviesError); // Mostra o erro
        } finally {
            this.isLoadingFavorites = false;
        }
    },
    initializePreferences() {
      this.notifications = localStorage.getItem('notifications') !== 'false';
      this.language = localStorage.getItem('language') || 'pt-BR';
      this.isDarkMode = this.themeStore.isDarkMode; // Pega do Pinia
    },
    async handlePhotoUpload(file) {
        if (!this.user || !(this.user.id || this.user._id)) {
            this.handleError("Dados do usuário não carregados para upload de foto.");
            return;
        }
        this.isSaving = true;
        try {
            // userService.uploadProfilePhoto deve enviar o arquivo para o backend
            // e o backend retorna a nova URL da foto ou o objeto user atualizado
            const updatedUserOrPhotoUrl = await userService.uploadProfilePhoto(file); // Ajuste userService
            if (typeof updatedUserOrPhotoUrl === 'string') {
                this.user.photo = updatedUserOrPhotoUrl;
            } else if (updatedUserOrPhotoUrl && updatedUserOrPhotoUrl.photo) {
                this.user.photo = updatedUserOrPhotoUrl.photo;
            }
            // this.authStore.updateUserPhoto(this.user.photo); // Se usar Pinia
            localStorage.setItem('user', JSON.stringify(this.user)); // Atualiza localStorage
            this.showSuccess('Foto de perfil atualizada!');
        } catch (error) {
            this.handleError(error.message || 'Erro ao atualizar foto de perfil');
        } finally {
            this.isSaving = false;
        }
    },
    async handleEmailSave(newEmail) {
        if (!this.user || !this.user.id) {
             this.handleError("Dados do usuário não carregados para atualizar e-mail.");
            return;
        }
        this.isSaving = true;
        try {
            const updatedUserData = await userService.updateProfile({
                // O backend usa o token para saber qual usuário, não precisa de ID aqui
                name: this.user.name, // Envie o nome atual se não quiser que ele seja apagado
                email: newEmail
            });
            this.user = { ...this.user, ...updatedUserData }; // Mescla as atualizações
            // this.authStore.setUser(this.user); // Se usar Pinia
            localStorage.setItem('user', JSON.stringify(this.user));
            this.emailEditingEnabled = false;
            this.showSuccess('E-mail atualizado!');
        } catch (error) {
            this.handleError(error.message || 'Erro ao atualizar e-mail.');
        } finally {
            this.isSaving = false;
        }
    },
    async handlePasswordSave({ currentPassword, newPassword }) {
        if (!this.user || !this.user.id) {
            this.handleError("Dados do usuário não carregados para atualizar senha.");
            return;
        }
        this.isSaving = true;
        try {
            await userService.updatePassword({ currentPassword, newPassword });
            this.currentPassword = '';
            this.newPassword = '';
            this.confirmPassword = '';
            this.passwordEditingEnabled = false;
            this.showSuccess('Senha atualizada!');
        } catch (error) {
            this.handleError(error.message || 'Erro ao atualizar senha. Verifique sua senha atual.');
        } finally {
            this.isSaving = false;
        }
    },
    async handleGenreToggle(genreId) {
        console.log('[HGT] Clicou no gênero ID:', genreId);
        console.log('[HGT] Estado de this.user ANTES da verificação:', JSON.parse(JSON.stringify(this.user)));
        console.log('[HGT] Estado de this.user.id (ou _id):', this.user ? (this.user.id || this.user._id) : 'user ou id indefinido');
        console.log('[HGT] Estado de this.selectedGenres ANTES da lógica:', JSON.parse(JSON.stringify(this.selectedGenres)));

        // CORREÇÃO NA VERIFICAÇÃO DO USUÁRIO
        if (!this.user || !(this.user.id || this.user._id)) {
            this.handleError("ERRO HGT-A: Dados do usuário não carregados para atualizar gêneros.");
            console.error("[HGT] Falha na verificação: this.user ou this.user.id/_id está faltando.");
            return;
        }

        let newSelectedGenresArray = [...this.selectedGenres];
        const index = newSelectedGenresArray.indexOf(genreId);
        let actionMessage = '';

        if (index === -1) {
            if (newSelectedGenresArray.length < 5) {
                newSelectedGenresArray.push(genreId);
                actionMessage = 'Gênero adicionado!';
            } else {
                this.handleError('Você pode selecionar no máximo 5 gêneros.');
                return;
            }
        } else {
            newSelectedGenresArray = newSelectedGenresArray.filter(id => id !== genreId);
            actionMessage = 'Gênero removido!';
        }

        // Atualiza this.selectedGenres reativamente para a UI ANTES da chamada API
        this.selectedGenres = newSelectedGenresArray; 

        this.isSaving = true;
        try {
            console.log('[HGT] Enviando para userService.updateGenres:', JSON.parse(JSON.stringify(newSelectedGenresArray)));
            // userService.updateGenres deve chamar /api/users/me/genres e enviar o array de IDs
            const updatedUserData = await userService.updateGenres(newSelectedGenresArray); 

            // Sincroniza this.user.favoriteGenres e this.selectedGenres com a resposta do backend
            if (updatedUserData && updatedUserData.favoriteGenres && Array.isArray(updatedUserData.favoriteGenres)) {
                this.user.favoriteGenres = [...updatedUserData.favoriteGenres]; // Assume que backend retorna array de IDs

                // Re-sincroniza selectedGenres para garantir que são IDs válidos de availableGenres
                const availableGenreIds = this.availableGenres.map(g => g.id);
                this.selectedGenres = this.user.favoriteGenres.filter(favGenreId => 
                    availableGenreIds.includes(favGenreId)
                );
                 console.log('[HGT] Gêneros atualizados com sucesso. Resposta do backend (favoriteGenres):', JSON.parse(JSON.stringify(this.user.favoriteGenres)));
                 console.log('[HGT] this.selectedGenres APÓS sucesso:', JSON.parse(JSON.stringify(this.selectedGenres)));
            } else {
                // Se a resposta não for o esperado, não lança erro, mas loga e mantém o estado da UI.
                // A API deveria retornar o usuário atualizado com favoriteGenres.
                console.warn('[HGT] Resposta do backend ao atualizar gêneros não continha favoriteGenres válidos.');
                // Mantém this.selectedGenres como está (com a mudança otimista da UI) ou reverte se preferir.
            }
            
            localStorage.setItem('user', JSON.stringify(this.user));
            this.showSuccess(actionMessage);

        } catch (error) {
            console.error('[HGT] Erro ao chamar userService.updateGenres:', error);
            this.handleError(error.message || 'ERRO HGT-B: Erro ao atualizar preferências de gêneros.');
            
            // Reverte a mudança visual em this.selectedGenres se a API falhar
            // Para isso, usa o estado de this.user.favoriteGenres (que não foi atualizado pela API ainda)
            const availableGenreIds = this.availableGenres.map(g => g.id);
            this.selectedGenres = (this.user.favoriteGenres || []).filter(favGenreId => 
                availableGenreIds.includes(favGenreId)
            );
            console.log('[HGT] this.selectedGenres REVERTIDO após falha:', JSON.parse(JSON.stringify(this.selectedGenres)));
        } finally {
            this.isSaving = false;
        }
    },
    toggleEmailEdit() { this.emailEditingEnabled = !this.emailEditingEnabled; },
    startPasswordEdit() { this.passwordEditingEnabled = true; },
    cancelPasswordEdit() {
      this.passwordEditingEnabled = false
      this.newPassword = ''
      this.confirmPassword = ''
    },

    async handleDarkModeToggle() {
      try {
        this.isSaving = true
        await userService.updatePreferences({ darkMode: this.isDarkMode })
        this.themeStore.setTheme(this.isDarkMode)
        this.showSuccess('Tema atualizado com sucesso!')
      } catch (error) {
        this.handleError('Erro ao atualizar tema')
        this.isDarkMode = !this.isDarkMode
      } finally {
        this.isSaving = false
      }
    },
    async handleNotificationToggle() {
      try {
        this.isSaving = true
        await userService.updatePreferences({ notifications: this.notifications })
        localStorage.setItem('notifications', this.notifications)
        this.showSuccess('Preferências de notificação atualizadas!')
      } catch (error) {
        this.handleError('Erro ao atualizar preferências de notificação')
        this.notifications = !this.notifications
      } finally {
        this.isSaving = false
      }
    },
    async handleLanguageChange() {
      try {
        this.isSaving = true
        await userService.updatePreferences({ language: this.language })
        localStorage.setItem('language', this.language)
        this.showSuccess('Idioma atualizado com sucesso!')
      } catch (error) {
        this.handleError('Erro ao atualizar idioma')
        this.language = localStorage.getItem('language') || 'pt-BR'
      } finally {
        this.isSaving = false
      }
    },
    async handleLogout() {
      try {
        this.isSaving = true
        // Limpa autenticação fake
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        this.$router.push('/login')
      } catch (error) {
        this.handleError('Erro ao fazer logout')
      } finally {
        this.isSaving = false
      }
    },
    showSuccess(message) {
      this.successMessage = message
      this.showSuccessMessage = true
      setTimeout(() => {
        this.showSuccessMessage = false
      }, 5000)
    },
    handleError(message) {
      this.errorMessage = message
      this.showErrorMessage = true
      setTimeout(() => {
        this.showErrorMessage = false
      }, 5000)
    }
  }
}
</script>

<style scoped>
.usuario-view {
  padding: 2rem;
  min-height: 100vh;
  background: var(--bg-color);
}

.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--primary-color);
  color: white;
  padding: 8px;
  z-index: 100;
  transition: top 0.3s;
}

.skip-link:focus {
  top: 0;
}

.profile-content {
  max-width: 1200px;
  margin: 0 auto;
  transition: opacity 0.3s ease;
}

.profile-content.is-loading {
  opacity: 0.7;
  pointer-events: none;
}

.profile-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin: 2rem auto;
}

.profile-section,
.preferences-section,
.genres-section,
.account-actions-section {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.section-header {
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
}

.section-header h3 {
  font-size: 1.5rem;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  color: var(--text-color);
}

.section-header i {
  color: var(--primary-color);
  font-size: 1.2rem;
}

.section-description {
  color: var(--secondary-text);
  margin: 0.5rem 0 0 2rem;
  font-size: 0.9rem;
}

.preferences-grid,
.account-actions-grid {
  display: grid;
  gap: 1.5rem;
}

.preference-item,
.action-item {
  background: var(--bg-color);
  border-radius: 8px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  border: 1px solid var(--border-color);
}

.preference-item:hover,
.action-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: var(--primary-color);
}

.preference-header,
.action-header {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 0.8rem;
}

.preference-header i,
.action-header i {
  color: var(--primary-color);
  font-size: 1.2rem;
  transition: transform 0.3s ease;
}

.preference-item:hover .preference-header i,
.action-item:hover .action-header i {
  transform: scale(1.1);
}

.preference-header h4,
.action-header h4 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-color);
}

.preference-description,
.action-description {
  color: var(--secondary-text);
  font-size: 0.9rem;
  margin: 0 0 1rem 0;
  line-height: 1.5;
}

.toggle-switch {
  position: relative;
  width: 50px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--border-color);
  transition: .4s;
  border-radius: 24px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: var(--primary-color);
}

input:checked + .toggle-slider:before {
  transform: translateX(26px);
}

.language-select {
  width: 100%;
  padding: 0.8rem;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-color);
  color: var(--text-color);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.language-select:focus {
  border-color: var(--primary-color);
  outline: none;
  box-shadow: 0 0 0 3px rgba(var(--primary-color-rgb), 0.1);
}

.language-select:hover {
  border-color: var(--primary-color);
}

.logout-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  width: 100%;
  padding: 1rem;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.logout-button:hover:not(:disabled) {
  background-color: #d32f2f;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(244, 67, 54, 0.2);
}

.logout-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.logout-button i {
  font-size: 1.1rem;
}

.success-message,
.error-message {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-size: 0.9rem;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(4px);
  max-width: 90%;
}

.success-message {
  background: rgba(76, 175, 80, 0.1);
  color: #4caf50;
  border: 1px solid rgba(76, 175, 80, 0.2);
}

.error-message {
  background: rgba(244, 67, 54, 0.1);
  color: #f44336;
  border: 1px solid rgba(244, 67, 54, 0.2);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(var(--bg-color-rgb), 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 3px solid var(--border-color);
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

@media (max-width: 768px) {
  .usuario-view {
    padding: 1rem;
  }

  .profile-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    margin: 1.5rem auto;
  }

  .profile-section,
  .preferences-section,
  .genres-section,
  .account-actions-section {
    padding: 1.5rem;
  }

  .section-header h3 {
    font-size: 1.3rem;
  }

  .section-description {
    margin-left: 0;
  }

  .preference-item,
  .action-item {
    padding: 1.2rem;
  }

  .success-message,
  .error-message {
    bottom: 1rem;
    right: 1rem;
    left: 1rem;
    max-width: none;
  }
}

@media (min-width: 1200px) {
  .profile-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
</style>