<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useChecklistStore } from '@/stores/checklist'

const route = useRoute()
const router = useRouter()
const store = useChecklistStore()

const navItems = [
  { label: '图鉴', to: '/', icon: 'menu_book' },
  { label: '泡茶步骤', to: '/brewing', icon: 'local_cafe' },
  { label: '方案预设', to: '/presets', icon: 'palette' },
  { label: '一席茶清单', to: '/session', icon: 'checklist' },
]

/** 当前路由名称，用于高亮导航；详情页归属图鉴高亮 */
const activeRoute = computed(() => {
  if (route.name === 'teaware-detail' || route.path.startsWith('/teaware/')) {
    return '/'
  }
  return route.path
})

/**
 * 导航至指定路由。
 * @param path - 目标路径
 */
function navigate(path: string): void {
  if (route.path !== path) {
    router.push(path)
  }
}
</script>

<template>
  <q-layout view="lHh Lpr lFf" class="app-layout">
    <q-header elevated class="bg-primary text-white no-print">
      <q-toolbar>
        <q-toolbar-title class="text-weight-medium">
          茶器图鉴 · 一席茶
        </q-toolbar-title>

        <q-btn
          v-for="item in navItems"
          :key="item.to"
          flat
          :icon="item.icon"
          :label="item.label"
          :class="{ 'nav-active': activeRoute === item.to }"
          @click="navigate(item.to)"
        />

        <q-badge
          v-if="store.selectedCount > 0"
          color="accent"
          floating
          class="selected-badge"
        >
          {{ store.selectedCount }}
        </q-badge>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<style scoped lang="scss">
.nav-active {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 4px;
}

.selected-badge {
  top: 8px;
  right: 8px;
}
</style>
