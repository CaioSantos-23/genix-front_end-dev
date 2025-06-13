import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import TinderMode from '../views/TinderMode.vue';
import UsuarioView from '@/views/UsuarioView.vue';
import PartyView from '@/views/PartyView.vue';
import MovieView from '@/views/MovieView.vue';
import GitHubTeam from '@/views/GitHubTeam.vue';
import LoginView from '@/views/LoginView.vue';
import RegisterView from '@/views/RegisterView.vue';

const routes = [
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { requiresAuth: false, showNavbar: false }
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: { requiresAuth: false, showNavbar: false }
  },
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { requiresAuth: true, showNavbar: true }
  },
  {
    path: '/tinder',
    name: 'tinder',
    component: TinderMode,
    meta: { requiresAuth: true, showNavbar: true }
  },
  {
    path: '/profile',
    name: 'profile',
    component: UsuarioView,
    meta: { requiresAuth: true, showNavbar: true }
  },
  {
    path: '/party',
    name: 'party',
    component: PartyView,
    meta: { requiresAuth: true, showNavbar: true }
  },
  {
    path: '/movie/:id',
    name: 'movie',
    component: MovieView,
    meta: { requiresAuth: true, showNavbar: true }
  },
  {
    path: '/team',
    name: 'team',
    component: GitHubTeam,
    meta: { requiresAuth: true, showNavbar: true }
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

// Guarda de navegação para verificar autenticação
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('token'); // Você pode ajustar isso conforme sua lógica de autenticação
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
  } else if ((to.path === '/login' || to.path === '/register') && isAuthenticated) {
    next('/');
  } else {
    next();
  }
});

export default router;