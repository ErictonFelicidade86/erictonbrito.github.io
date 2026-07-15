import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
]

// Hash history: evita 404 no GitHub Pages (não depende de rewrite do servidor)
const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
