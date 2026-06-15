import { createRouter, createWebHistory } from 'vue-router'
import TeawareDetailPage from '@/pages/TeawareDetailPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'catalog',
      component: () => import('@/pages/CatalogPage.vue'),
      meta: { title: '茶器图鉴' },
    },
    {
      path: '/session',
      name: 'session',
      component: () => import('@/pages/SessionPage.vue'),
      meta: { title: '一席茶清单' },
    },
    {
      path: '/teaware/:id',
      name: 'teaware-detail',
      component: TeawareDetailPage,
      meta: { title: '茶器详情' },
    },
    {
      path: '/presets',
      name: 'presets',
      component: () => import('@/pages/PresetPage.vue'),
      meta: { title: '方案预设' },
    },
    {
      path: '/brewing',
      name: 'brewing',
      component: () => import('@/pages/BrewingStepsPage.vue'),
      meta: { title: '泡茶步骤' },
    },
  ],
})

router.afterEach((to) => {
  const title = (to.meta.title as string) ?? '茶器图鉴'
  document.title = `${title} · 一席茶`
})

export default router
