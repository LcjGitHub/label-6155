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
      path: '/tea-catalog',
      name: 'tea-catalog',
      component: () => import('@/pages/TeaCatalogPage.vue'),
      meta: { title: '茶叶品种' },
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
      path: '/scale-estimation',
      name: 'scale-estimation',
      component: () => import('@/pages/ScaleEstimationPage.vue'),
      meta: { title: '规模估算' },
    },
    {
      path: '/brewing',
      name: 'brewing',
      component: () => import('@/pages/BrewingStepsPage.vue'),
      meta: { title: '泡茶步骤' },
    },
    {
      path: '/water-guide',
      name: 'water-guide',
      component: () => import('@/pages/WaterGuidePage.vue'),
      meta: { title: '水温指引' },
    },
    {
      path: '/favorites',
      name: 'favorites',
      component: () => import('@/pages/FavoritesPage.vue'),
      meta: { title: '我的收藏' },
    },
    {
      path: '/history',
      name: 'history',
      component: () => import('@/pages/HistoryPage.vue'),
      meta: { title: '快照历史' },
    },
    {
      path: '/care-tips',
      name: 'care-tips',
      component: () => import('@/pages/CareTipsPage.vue'),
      meta: { title: '保养贴士' },
    },
    {
      path: '/etiquette',
      name: 'etiquette',
      component: () => import('@/pages/EtiquettePage.vue'),
      meta: { title: '礼仪须知' },
    },
  ],
})

router.afterEach((to) => {
  const title = (to.meta.title as string) ?? '茶器图鉴'
  document.title = `${title} · 一席茶`
})

export default router
