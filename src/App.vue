<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useChecklistStore } from '@/stores/checklist'
import { useFavoritesStore } from '@/stores/favorites'

const route = useRoute()
const router = useRouter()
const store = useChecklistStore()
const favoritesStore = useFavoritesStore()

const navItems = [
  { label: '图鉴', to: '/', icon: 'menu_book', badge: 0 },
  { label: '泡茶步骤', to: '/brewing', icon: 'local_cafe', badge: 0 },
  { label: '方案预设', to: '/presets', icon: 'palette', badge: 0 },
  { label: '一席茶清单', to: '/session', icon: 'checklist', badgeKey: 'checklist' },
  { label: '快照历史', to: '/history', icon: 'history', badgeKey: 'snapshots' },
  { label: '我的收藏', to: '/favorites', icon: 'favorite', badgeKey: 'favorites' },
]

function getNavBadge(badgeKey?: string): number {
  if (badgeKey === 'checklist') return store.selectedCount
  if (badgeKey === 'snapshots') return store.snapshotCount
  if (badgeKey === 'favorites') return favoritesStore.favoriteCount
  return 0
}

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
    <q-header elevated class="bg-primary text-white no-print app-header">
      <q-toolbar class="app-toolbar">
        <q-toolbar-title class="text-weight-medium app-title">
          茶器图鉴 · 一席茶
        </q-toolbar-title>

        <div class="nav-buttons">
          <q-btn
            v-for="item in navItems"
            :key="item.to"
            flat
            :icon="item.icon"
            :label="item.label"
            :class="{ 'nav-active': activeRoute === item.to }"
            class="nav-btn"
            @click="navigate(item.to)"
          >
            <q-badge
              v-if="getNavBadge(item.badgeKey) > 0"
              color="accent"
              floating
              class="nav-badge"
            >
              {{ getNavBadge(item.badgeKey) }}
            </q-badge>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<style scoped lang="scss">
.app-toolbar {
  flex-wrap: wrap;
  gap: 4px;
}

.app-title {
  flex-shrink: 0;
  white-space: nowrap;
}

.nav-buttons {
  display: flex;
  gap: 2px;
  flex-shrink: 1;
}

.nav-btn {
  padding: 0 8px;
  min-height: 36px;
}

.nav-active {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 4px;
}

.nav-badge {
  top: 2px;
  right: 2px;
}

@media (max-width: 768px) {
  .app-toolbar {
    padding: 8px;
  }

  .app-title {
    font-size: 1rem;
  }

  .nav-btn {
    padding: 0 6px;
    font-size: 0.875rem;

    .q-icon {
      font-size: 1.25rem;
    }
  }
}

@media (max-width: 480px) {
  .app-title {
    font-size: 0.9rem;
  }

  .nav-btn {
    padding: 0 4px;
    font-size: 0.8rem;
  }

  .nav-buttons {
    gap: 0;
  }
}
</style>
