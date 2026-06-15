<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useFavoritesStore } from '@/stores/favorites'

const router = useRouter()
const $q = useQuasar()
const favoritesStore = useFavoritesStore()

function goToDetail(id: string): void {
  router.push({ name: 'teaware-detail', params: { id } })
}

function goToCatalog(): void {
  router.push('/')
}

function handleCardKeydown(event: KeyboardEvent, id: string): void {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    goToDetail(id)
  }
}

function toggleFavorite(event: Event, id: string): void {
  event.stopPropagation()
  favoritesStore.toggleFavorite(id)
}

function handleClear(): void {
  if (favoritesStore.favoriteCount === 0) {
    return
  }
  $q.dialog({
    title: '清空收藏',
    message: '确定要清空所有已收藏的茶器吗？',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    favoritesStore.clearFavorites()
    $q.notify({ type: 'info', message: '收藏已清空' })
  })
}

function handleAddAllToChecklist(): void {
  if (favoritesStore.favoriteCount === 0) {
    return
  }
  const addedCount = favoritesStore.addAllToChecklist()
  if (addedCount > 0) {
    $q.notify({ type: 'positive', message: `已加入 ${addedCount} 件器物到清单` })
  } else {
    $q.notify({ type: 'info', message: '所有收藏的器物已在清单中' })
  }
  router.push({ name: 'session' })
}
</script>

<template>
  <q-page class="favorites-page q-pa-md">
    <div class="page-header q-mb-md">
      <div>
        <h1 class="page-title q-ma-none">我的收藏</h1>
        <p class="page-subtitle q-ma-none q-mt-xs text-grey-7">
          收藏你喜爱的茶器，随时回顾与欣赏。
        </p>
      </div>
      <div class="header-actions no-print">
        <q-btn
          v-if="favoritesStore.favoriteCount > 0"
          color="primary"
          icon="playlist_add"
          label="全部加入清单"
          class="q-mr-sm"
          @click="handleAddAllToChecklist"
        />
        <q-btn
          v-if="favoritesStore.favoriteCount > 0"
          color="grey"
          icon="delete_sweep"
          label="清空收藏"
          flat
          @click="handleClear"
        />
      </div>
    </div>

    <div v-if="favoritesStore.favoriteCount === 0" class="empty-state q-py-xl">
      <q-icon name="favorite_border" size="5rem" color="grey-4" />
      <p class="text-grey-6 q-mt-md">还没有收藏的茶器</p>
      <p class="text-grey-5 text-body2 q-mt-xs">
        去<span class="text-primary cursor-pointer" @click="goToCatalog">图鉴页</span>发现你喜欢的茶器吧
      </p>
    </div>

    <section
      v-for="group in favoritesStore.groupedFavorites"
      :key="group.category"
      class="category-section q-mb-xl"
    >
      <h2 class="category-title">{{ group.category }}</h2>

      <div class="teaware-grid">
        <q-card
          v-for="item in group.items"
          :key="item.id"
          flat
          bordered
          tabindex="0"
          role="button"
          :aria-label="`查看${item.name}详情`"
          class="teaware-card clickable-card"
          @click="goToDetail(item.id)"
          @keydown="handleCardKeydown($event, item.id)"
        >
          <q-img :src="item.image" :ratio="4 / 3" class="teaware-image">
            <div class="absolute-bottom text-subtitle2 teaware-image-label">
              {{ item.category }}
            </div>
          </q-img>

          <q-card-section>
            <div class="text-h6">{{ item.name }}</div>
          </q-card-section>

          <q-card-actions align="right" class="no-print card-actions">
            <q-btn
              icon="favorite"
              color="red"
              flat
              dense
              round
              aria-label="取消收藏"
              @click="toggleFavorite($event, item.id)"
            />
          </q-card-actions>
        </q-card>
      </div>
    </section>
  </q-page>
</template>

<style scoped lang="scss">
.page-header {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #3e2723;
}

.page-subtitle {
  max-width: 640px;
  line-height: 1.6;
}

.empty-state {
  text-align: center;
}

.category-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #5d4037;
  margin: 0 0 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #d7ccc8;
}

.teaware-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.teaware-card {
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(62, 39, 35, 0.12);
  }
}

.clickable-card {
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid #8d6e63;
    outline-offset: 2px;
  }
}

.teaware-image-label {
  background: rgba(62, 39, 35, 0.65);
}
</style>
