<template>
  <div class="github-team">
    <div class="container">
      <div class="page-header">
        <p class="page-subtitle">Conheça os desenvolvedores por trás deste projeto</p>
      </div>

      <div class="team-grid">
        <!-- Team member card template -->
        <div v-for="member in teamMembers" :key="member.github" class="team-member">
          <div class="member-card">
            <div class="member-avatar">
              <img :src="member.avatar" :alt="`Foto de perfil de ${member.name}`">
              <div class="member-status" :class="{ 'online': member.status === 'online' }" aria-label="Status online"></div>
            </div>
            <div class="member-info">
              <h2 class="member-name">{{ member.name }}</h2>
              <p class="member-role">{{ member.role }}</p>
              <div class="member-bio">{{ member.bio }}</div>
              <div class="member-links">
                <a 
                  :href="member.github" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="github-link"
                  aria-label="Ver perfil no GitHub"
                >
                  <i class="fab fa-github" aria-hidden="true"></i>
                  GitHub
                </a>
                <a 
                  v-if="member.linkedin"
                  :href="member.linkedin" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="linkedin-link"
                  aria-label="Ver perfil no LinkedIn"
                >
                  <i class="fab fa-linkedin" aria-hidden="true"></i>
                  LinkedIn
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GitHubTeam',
  data() {
    return {
      teamMembers: [
        {
          name: 'Luis Filipe',
          role: 'Frontend Developer',
          bio: 'Desenvolvedor Frontend',
          github: 'https://github.com/lfslDEV',
          linkedin: 'https://linkedin.com/in/luisfilipe-dev',
          avatar: 'https://avatars.githubusercontent.com/lfslDEV',
          status: 'online'
        },
        {
            name: 'Maria Eduarda',
            role: 'DevOps',
            bio: 'Desenvolvimento e Operações',
            github: 'https://github.com/Tenko404',
            linkedin: 'https://www.linkedin.com/in/maria-eduarda-franklin-barbosa/',
            avatar: 'https://avatars.githubusercontent.com/Tenko404',
            status: 'online'
        },
        {
            name: 'Kayo',
            role: 'Frontend Developer',
            bio: 'Desenvolvedor Frontend',
            github: 'https://github.com/Kayostavares',
            linkedin: 'https://www.linkedin.com/in/kayodossantos/',
            avatar: 'https://avatars.githubusercontent.com/Kayostavares',
            status: 'online'
        },
        {
            name: 'Caio',
            role: 'Administrador',
            bio: 'Organizador do projeto',
            github: 'https://github.com/CaioSantos-23',
            avatar: 'https://avatars.githubusercontent.com/CaioSantos-23',
            status: 'offline'
        },
        {
            name: 'Luís Fillipe',
            role: 'Backend Developer',
            bio: 'Desenvolvedor Backend',
            github: 'https://github.com/D9LTA',
            avatar: 'https://avatars.githubusercontent.com/D9LTA',
            status: 'offline'
        }
      ]
    }
  }
}
</script>

<style scoped>
.github-team {
  min-height: calc(100vh - 60px);
  padding: 2rem 1rem;
  background: var(--bg-color);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
  animation: fadeInDown 0.6s ease-out;
}

.page-title {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  background: linear-gradient(45deg, var(--primary-color), #6c5ce7);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 800;
}

.page-subtitle {
  color: var(--secondary-text);
  font-size: 1.1rem;
  margin: 0;
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  padding: 1rem;
}

.team-member {
  perspective: 1000px;
}

.member-card {
  background: var(--header-bg);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  animation: fadeInUp 0.6s ease-out;
}

.member-card:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.member-avatar {
  position: relative;
  width: 120px;
  height: 120px;
  margin-bottom: 1.5rem;
}

.member-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--primary-color);
  padding: 3px;
  transition: transform 0.3s ease;
}

.member-card:hover .member-avatar img {
  transform: scale(1.05);
}

.member-status {
  position: absolute;
  bottom: 5px;
  right: 5px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #ccc;
  border: 2px solid var(--header-bg);
}

.member-status.online {
  background-color: #4CAF50;
}

.member-info {
  width: 100%;
}

.member-name {
  font-size: 1.5rem;
  margin: 0 0 0.5rem;
  color: var(--text-color);
}

.member-role {
  color: var(--primary-color);
  font-size: 0.95rem;
  margin: 0 0 1rem;
  font-weight: 500;
}

.member-bio {
  color: var(--secondary-text);
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 1.5rem;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  max-height: 4.5em;
}

.member-links {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.member-links a {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.github-link {
  background-color: #24292e;
  color: white;
}

.github-link:hover {
  background-color: #2f363d;
  transform: translateY(-2px);
}

.linkedin-link {
  background-color: #0077b5;
  color: white;
}

.linkedin-link:hover {
  background-color: #006399;
  transform: translateY(-2px);
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .github-team {
    padding: 1rem;
  }

  .page-title {
    font-size: 2rem;
  }

  .page-subtitle {
    font-size: 1rem;
  }

  .team-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .member-card {
    padding: 1.5rem;
  }

  .member-avatar {
    width: 100px;
    height: 100px;
  }

  .member-name {
    font-size: 1.3rem;
  }

  .member-role {
    font-size: 0.9rem;
  }

  .member-bio {
    font-size: 0.85rem;
  }

  .member-links {
    flex-direction: column;
    gap: 0.75rem;
  }

  .member-links a {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.8rem;
  }

  .member-card {
    padding: 1.25rem;
  }

  .member-avatar {
    width: 90px;
    height: 90px;
  }
}
</style> 