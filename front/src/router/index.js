import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { guestOnly: true, title: 'Connexion' }
    },
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: { requiresAuth: true, title: 'Fil d\'actualité' }
    },
    {
      path: '/messages',
      name: 'messages',
      component: () => import('@/views/MessagesView.vue'), 
      meta: { requiresAuth: true, title: 'Messages' }
    },
    {
      path: '/profil',
      name: 'profil',
      component: () => import('@/views/ProfilView.vue'),
      meta: { requiresAuth: true, title: 'Mon Profil' }
    },
    {
  path: '/collaborateurs',
  name: 'amis', 
  component: () => import('@/views/FriendsView.vue'),
  meta: { requiresAuth: true, title: 'Collaborateurs' }
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ]
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  if (to.meta.title) {
    document.title = `${to.meta.title} | Connect'In`
  }

  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    next({ name: 'login' })
  } else if (to.meta.guestOnly && userStore.isAuthenticated) {
    next({ name: 'home' })
  } else {
    next()
  }
})

export default router