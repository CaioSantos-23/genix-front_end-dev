<template>
  <div id="app">
    <!-- Meta tag for responsive design -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <nav v-if="$route.meta.showNavbar" class="navbar">
      <div class="nav-content">
        <!-- Logo linking to home -->
        <router-link to="/" class="nav-logo">
          <img src="@/assets/logo.png" alt="Genix Logo">
        </router-link>
        <!-- Mobile menu toggle button -->
        <button class="mobile-menu-toggle" @click="toggleMobileMenu" aria-label="Toggle menu">
          <i class="fas fa-bars"></i>
        </button>
        <div class="nav-links" :class="{ 'active': isMobileMenuOpen }">
          <!-- Navigation links -->
          <router-link to="/" class="nav-link" @click="closeMobileMenu">
            <i class="fas fa-home mobile-icon"></i>
            <span>Home</span>
          </router-link>
          <router-link to="/tinder" class="nav-link" @click="closeMobileMenu">
            <i class="fas fa-heart mobile-icon"></i>
            <span>Tinder Mode</span>
          </router-link>
          <router-link to="/party" class="nav-link" @click="closeMobileMenu">
            <i class="fas fa-users mobile-icon"></i>
            <span>Party Mode</span>
          </router-link>
          <router-link to="/profile" class="nav-link" @click="closeMobileMenu">
            <i class="fas fa-user mobile-icon"></i>
            <span>Profile</span>
          </router-link>
        </div>
        <!-- Theme toggle button -->
        <button class="theme-toggle" @click="toggleTheme" aria-label="Toggle theme">
          <i :class="isDarkMode ? 'fas fa-moon' : 'fas fa-sun'"></i>
        </button>
      </div>
    </nav>

    <main class="main-content">
      <!-- Router view for displaying current route -->
      <router-view></router-view>
    </main>
    <!-- Footer component -->
    <FilmeFooter />
  </div>
</template>

<script>
import FilmeFooter from '@/components/FilmeFooter.vue'
import { useThemeStore } from '@/stores/themeStore'
import { storeToRefs } from 'pinia'
import { ref, onMounted, onUnmounted } from 'vue'

export default {
  name: 'App',
  components: {
    FilmeFooter,
  },
  setup() {
    const themeStore = useThemeStore()
    const isMobileMenuOpen = ref(false)
    const { isDarkMode } = storeToRefs(themeStore)
    
    // Initialize theme when app starts
    themeStore.initTheme()

    // Toggle mobile menu visibility
    const toggleMobileMenu = () => {
      isMobileMenuOpen.value = !isMobileMenuOpen.value
    }

    // Close mobile menu
    const closeMobileMenu = () => {
      isMobileMenuOpen.value = false
    }

    // Handle click outside mobile menu
    const handleClickOutside = (event) => {
      const navLinks = document.querySelector('.nav-links')
      const menuToggle = document.querySelector('.mobile-menu-toggle')
      
      if (isMobileMenuOpen.value && 
          navLinks && 
          !navLinks.contains(event.target) && 
          !menuToggle.contains(event.target)) {
        closeMobileMenu()
      }
    }

    // Add click event listener when component is mounted
    onMounted(() => {
      document.addEventListener('click', handleClickOutside)
    })

    // Remove event listener when component is unmounted
    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside)
    })

    return { 
      themeStore,
      isMobileMenuOpen,
      toggleMobileMenu,
      closeMobileMenu,
      isDarkMode,
      toggleTheme: themeStore.toggleTheme
    }
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Montserrat:wght@700;800&display=swap');

#app {
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-color);
}

body {
  margin: 0;
  padding: 0;
  height: 100vh; /* Ensure body takes full height */
  background-color: var(--bg-color);
}

h1, h2, h3, h4, h5, h6 {
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
}

.router-view {
  flex: 1 0 auto;
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 0;
}

.router-view > * {
  flex: 1 0 auto;
}

.navbar {
  background: var(--header-bg);
  padding: 0.8rem 1.5rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 1000;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.nav-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  height: 60px;
}

.nav-logo img {
  height: 50px;
  transition: transform 0.2s ease;
}

.nav-logo img:hover {
  transform: scale(1.05);
}

.nav-links {
  display: flex;
  gap: 2.5rem;
  align-items: center;
}

.nav-link {
  color: var(--text-color);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  padding: 0.5rem 1rem;
  position: relative;
  letter-spacing: 0.3px;
  border-radius: 8px;
  background: transparent;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0.25rem;
  left: 1rem;
  width: calc(100% - 2rem);
  height: 2px;
  background: linear-gradient(90deg, var(--primary-color), #6c5ce7);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s ease;
  border-radius: 1px;
}

.nav-link:hover::after,
.nav-link.router-link-active::after {
  transform: scaleX(1);
}

.nav-link::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(120deg, var(--primary-color), #6c5ce7);
  border-radius: 8px;
  opacity: 0;
  transform: scaleX(0.8) scaleY(0.5);
  transition: all 0.3s ease;
  z-index: -1;
}

.nav-link:hover::before {
  opacity: 0.1;
  transform: scaleX(1) scaleY(1);
}

.nav-link:hover {
  color: var(--primary-color);
  transform: translateY(-1px);
}

.nav-link.router-link-active {
  color: var(--primary-color);
  font-weight: 600;
  background: linear-gradient(120deg, rgba(var(--primary-rgb), 0.1), rgba(108, 92, 231, 0.1));
}

.nav-link.router-link-active::before {
  opacity: 0.15;
  transform: scaleX(1) scaleY(1);
}

.theme-toggle {
  background: none;
  border: none;
  color: var(--text-color);
  font-size: 1.1rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.2s ease;
  min-width: 40px;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 1rem;
}

.theme-toggle:hover {
  background-color: var(--hover-bg);
  transform: rotate(15deg);
}

.mobile-menu-toggle {
  display: none;
  background: none;
  border: none;
  color: var(--text-color);
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background-color 0.2s ease;
  min-width: 44px;
  min-height: 44px;
  align-items: center;
  justify-content: center;
}

.mobile-menu-toggle:hover {
  background-color: var(--hover-bg);
}

.main-content {
  flex: 1;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  box-sizing: border-box;
}

.mobile-icon {
  display: none;
  width: 20px;
  text-align: center;
  margin-right: 0.75rem;
}

.mobile-menu-close {
  display: none;
  background: none;
  border: none;
  color: var(--text-color);
  font-size: 1.2rem;
  padding: 0.5rem;
  cursor: pointer;
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
}

.mobile-menu-close:hover {
  background-color: var(--hover-bg);
}

@media (max-width: 768px) {
  .navbar {
    padding: 0.8rem 1rem;
  }

  .nav-content {
    height: 50px;
  }

  .nav-logo {
    display: none;
  }

  .mobile-menu-toggle {
    display: flex;
    margin-right: auto;
  }

  .mobile-icon {
    display: flex;
  }

  .nav-links {
    display: none;
    position: fixed;
    top: 58px;
    left: 0;
    width: 260px;
    height: auto;
    max-height: 70vh;
    background: var(--header-bg);
    flex-direction: column;
    padding: 1.5rem 1rem;
    gap: 0.5rem;
    box-shadow: 4px 0 16px rgba(0, 0, 0, 0.1);
    z-index: 999;
    overflow-y: auto;
    transform: translateX(-100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 0 0 12px 0;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }
  
  .nav-links.active {
    display: flex;
    transform: translateX(0);
  }
  
  .nav-link {
    display: flex;
    align-items: center;
    padding: 0.8rem 1rem;
    text-align: left;
    width: 100%;
    border-radius: 8px;
    transition: all 0.2s ease;
    font-size: 1rem;
    min-height: 40px;
  }
  
  .nav-link::after {
    bottom: auto;
    left: 0;
    width: 3px;
    height: calc(100% - 1rem);
    top: 0.5rem;
    transform: scaleY(0);
    transform-origin: top;
  }
  
  .nav-link:hover::after,
  .nav-link.router-link-active::after {
    transform: scaleY(1);
  }
  
  .nav-link:hover {
    transform: translateX(4px);
  }
  
  .mobile-menu-close {
    top: 0.8rem;
    right: 0.8rem;
  }
}

@media (max-width: 480px) {
  .navbar {
    padding: 0.8rem 0.75rem;
  }

  .nav-content {
    height: 48px;
  }
  
  .mobile-menu-toggle {
    font-size: 1.2rem;
  }

  .nav-links {
    width: 240px;
    max-height: 90vh;
    padding: 1.25rem 0.75rem;
  }

  .nav-link {
    padding: 0.75rem 0.875rem;
    font-size: 0.95rem;
    min-height: 38px;
  }
  
  .mobile-icon {
    width: 18px;
    margin-right: 0.75rem;
  }

  .mobile-menu-close {
    top: 0.6rem;
    right: 0.6rem;
    font-size: 1.2rem;
    width: 32px;
    height: 32px;
  }
}
</style>