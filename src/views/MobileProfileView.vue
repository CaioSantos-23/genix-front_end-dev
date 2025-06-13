<template>
  <div class="mobile-profile">
    <!-- Profile Header -->
    <div class="profile-header">
      <div class="profile-cover">
        <img :src="coverPhoto" alt="Cover Photo" class="cover-photo">
        <div class="profile-avatar">
          <img :src="profilePhoto" alt="Profile Photo" class="avatar">
          <button class="edit-photo-btn">
            <i class="fas fa-camera"></i>
          </button>
        </div>
      </div>
      <div class="profile-info">
        <h1 class="name">{{ userName }}</h1>
        <p class="bio">{{ userBio }}</p>
        <div class="profile-stats">
          <div class="stat">
            <span class="value">{{ followers }}</span>
            <span class="label">Seguidores</span>
          </div>
          <div class="stat">
            <span class="value">{{ following }}</span>
            <span class="label">Seguindo</span>
          </div>
          <div class="stat">
            <span class="value">{{ posts }}</span>
            <span class="label">Posts</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="action-buttons">
      <button class="action-btn primary">
        <i class="fas fa-edit"></i> Editar Perfil
      </button>
      <button class="action-btn secondary">
        <i class="fas fa-share-alt"></i> Compartilhar
      </button>
    </div>

    <!-- Profile Tabs -->
    <div class="profile-tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        class="tab-btn"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        <i :class="tab.icon"></i>
        <span>{{ tab.name }}</span>
      </button>
    </div>

    <!-- Tab Content -->
    <div class="tab-content">
      <!-- About Tab -->
      <div v-if="activeTab === 'about'" class="tab-pane">
        <div class="info-section">
          <h3><i class="fas fa-user"></i> Informações Pessoais</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">Nome</span>
              <span class="value">{{ userName }}</span>
            </div>
            <div class="info-item">
              <span class="label">Email</span>
              <span class="value">{{ email }}</span>
            </div>
            <div class="info-item">
              <span class="label">Localização</span>
              <span class="value">{{ location }}</span>
            </div>
            <div class="info-item">
              <span class="label">Membro desde</span>
              <span class="value">{{ joinDate }}</span>
            </div>
          </div>
        </div>

        <div class="info-section">
          <h3><i class="fas fa-briefcase"></i> Experiência</h3>
          <div class="experience-list">
            <div v-for="exp in experience" :key="exp.id" class="experience-item">
              <div class="exp-header">
                <h4>{{ exp.title }}</h4>
                <span class="period">{{ exp.period }}</span>
              </div>
              <p class="company">{{ exp.company }}</p>
              <p class="description">{{ exp.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Activity Tab -->
      <div v-if="activeTab === 'activity'" class="tab-pane">
        <div class="activity-list">
          <div v-for="activity in activities" :key="activity.id" class="activity-item">
            <div class="activity-icon" :class="activity.type">
              <i :class="activity.icon"></i>
            </div>
            <div class="activity-content">
              <p class="activity-text">{{ activity.text }}</p>
              <span class="activity-time">{{ activity.time }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Gallery Tab -->
      <div v-if="activeTab === 'gallery'" class="tab-pane">
        <div class="gallery-grid">
          <div v-for="photo in gallery" :key="photo.id" class="gallery-item">
            <img :src="photo.url" :alt="photo.description">
            <div class="gallery-overlay">
              <span class="photo-description">{{ photo.description }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MobileProfileView',
  data() {
    return {
      profilePhoto: require('@/assets/elonmusk.jpg'),
      coverPhoto: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      userName: 'Law',
      userBio: 'Desenvolvedor Full Stack | Apaixonado por tecnologia e inovação',
      followers: 1234,
      following: 567,
      posts: 89,
      email: 'law@example.com',
      location: 'São Paulo, Brasil',
      joinDate: 'Janeiro 2024',
      activeTab: 'about',
      tabs: [
        { id: 'about', name: 'Sobre', icon: 'fas fa-user' },
        { id: 'activity', name: 'Atividade', icon: 'fas fa-chart-line' },
        { id: 'gallery', name: 'Galeria', icon: 'fas fa-images' }
      ],
      experience: [
        {
          id: 1,
          title: 'Desenvolvedor Full Stack',
          company: 'Tech Solutions Inc.',
          period: '2020 - Presente',
          description: 'Desenvolvimento de aplicações web utilizando Vue.js e Node.js'
        },
        {
          id: 2,
          title: 'Desenvolvedor Frontend',
          company: 'Digital Agency',
          period: '2018 - 2020',
          description: 'Criação de interfaces responsivas e otimização de performance'
        }
      ],
      activities: [
        {
          id: 1,
          type: 'post',
          icon: 'fas fa-file-alt',
          text: 'Publicou um novo artigo sobre desenvolvimento web',
          time: '2 horas atrás'
        },
        {
          id: 2,
          type: 'like',
          icon: 'fas fa-heart',
          text: 'Curtiu uma publicação de João Silva',
          time: '5 horas atrás'
        },
        {
          id: 3,
          type: 'comment',
          icon: 'fas fa-comment',
          text: 'Comentou em uma discussão sobre Vue.js',
          time: '1 dia atrás'
        }
      ],
      gallery: [
        {
          id: 1,
          url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
          description: 'Código em ação'
        },
        {
          id: 2,
          url: 'https://images.unsplash.com/photo-1504384764586-bb4cdc1707b0?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
          description: 'Workshop de desenvolvimento'
        },
        {
          id: 3,
          url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
          description: 'Coding session'
        }
      ]
    }
  }
}
</script>

<style scoped>
.mobile-profile {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 60px;
}

.profile-header {
  background: white;
  border-radius: 0 0 20px 20px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.profile-cover {
  position: relative;
  height: 150px;
}

.cover-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-avatar {
  position: absolute;
  bottom: -40px;
  left: 20px;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 4px solid white;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.edit-photo-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  background: var(--primary-color);
  color: white;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.8rem;
}

.profile-info {
  padding: 50px 20px 20px;
}

.name {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 5px 0;
}

.bio {
  color: #666;
  font-size: 0.9rem;
  margin: 0 0 15px 0;
}

.profile-stats {
  display: flex;
  justify-content: space-around;
  border-top: 1px solid #eee;
  padding-top: 15px;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.value {
  font-size: 1.2rem;
  font-weight: 700;
  color: #333;
}

.label {
  font-size: 0.8rem;
  color: #666;
}

.action-buttons {
  display: flex;
  gap: 10px;
  padding: 20px;
  background: white;
  margin-top: 10px;
}

.action-btn {
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  border: none;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn.primary {
  background: var(--primary-color);
  color: white;
}

.action-btn.secondary {
  background: #f0f0f0;
  color: #333;
}

.profile-tabs {
  display: flex;
  background: white;
  margin-top: 10px;
  padding: 10px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.tab-btn {
  flex: 1;
  padding: 10px;
  border: none;
  background: none;
  color: #666;
  font-size: 0.9rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-btn i {
  font-size: 1.2rem;
}

.tab-btn.active {
  color: var(--primary-color);
  font-weight: 600;
}

.tab-content {
  padding: 20px;
}

.info-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}

.info-section h3 {
  font-size: 1.1rem;
  margin: 0 0 15px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-section h3 i {
  color: var(--primary-color);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.info-item .label {
  font-size: 0.8rem;
  color: #666;
}

.info-item .value {
  font-size: 0.9rem;
  color: #333;
}

.experience-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.experience-item {
  padding: 15px;
  background: #f8f8f8;
  border-radius: 8px;
}

.exp-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 5px;
}

.exp-header h4 {
  margin: 0;
  font-size: 1rem;
}

.period {
  font-size: 0.8rem;
  color: #666;
}

.company {
  font-size: 0.9rem;
  color: #666;
  margin: 0 0 5px 0;
}

.description {
  font-size: 0.85rem;
  color: #444;
  margin: 0;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.activity-item {
  display: flex;
  gap: 15px;
  background: white;
  padding: 15px;
  border-radius: 12px;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: white;
}

.activity-icon.post {
  background: #4CAF50;
}

.activity-icon.like {
  background: #E91E63;
}

.activity-icon.comment {
  background: #2196F3;
}

.activity-content {
  flex: 1;
}

.activity-text {
  margin: 0 0 5px 0;
  font-size: 0.9rem;
}

.activity-time {
  font-size: 0.8rem;
  color: #666;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.gallery-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
}

.gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gallery-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  padding: 10px;
  color: white;
}

.photo-description {
  font-size: 0.8rem;
}

@media (max-width: 480px) {
  .profile-avatar {
    width: 80px;
    height: 80px;
    bottom: -30px;
  }

  .name {
    font-size: 1.3rem;
  }

  .action-buttons {
    flex-direction: column;
    gap: 10px;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .gallery-grid {
    grid-template-columns: 1fr;
  }
}
</style> 