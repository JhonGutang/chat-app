import { createRouter, createWebHistory } from 'vue-router'
import PublicChat from  '@/components/PublicChat.vue'
import PrivateChat from  '@/components/PrivateChat.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/public-chat',
      component: PublicChat
    },
    {
      path: '/private-chat',
      component: PrivateChat
    }
  ]
})

export default router
