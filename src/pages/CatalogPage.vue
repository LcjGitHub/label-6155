<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useChecklistStore } from '@/stores/checklist'
import { useFavoritesStore } from '@/stores/favorites'

const router = useRouter()
const store = useChecklistStore()
const favoritesStore = useFavoritesStore()

const activeCategory = ref('')

const filteredGroups = computed(() => {
  if (!activeCategory.value) {
    return store.groupedItemsByKeyword
  }
  return store.groupedItemsByKeyword.filter(
    (group) => group.category === activeCategory.value,
  )
})

const hasNoResults = computed(
  () => filteredGroups.value.length === 0 && (store.searchKeyword.trim() !== '' || activeCategory.value !== ''),
)

/**
 * 设置分类筛选。
 * @param category - 分类名，空字符串为全部
 */
function setCategory(category: string): void {
  activeCategory.value = category
}

/** 前往清单页勾选 */
function goToSession(): void {
  router.push('/session')
}

/**
 * 前往茶器详情页
 * @param id - 器物 id
 */
function goToDetail(id: string): void {
  router.push({ name: 'teaware-detail', params: { id } })
}

/**
 * 键盘事件处理：回车/空格键跳转详情页
 * @param event - 键盘事件
 * @param id - 器物 id
 */
function handleCardKeydown(event: KeyboardEvent, id: string): void {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    goToDetail(id)
  }
}

/**
 * 切换收藏状态
 * @param event - 点击事件
 * @param id - 器物 id
 */
function toggleFavorite(event: Event, id: string): void {
  event.stopPropagation()
  favoritesStore.toggleFavorite(id)
}
</script>

<template>
  <q-page class="catalog-page q-pa-md">
    <div class="page-header q-mb-md">
      <div>
        <h1 class="page-title q-ma-none">茶器图鉴</h1>
        <p class="page-subtitle q-ma-none q-mt-xs text-grey-7">
          浏览传统茶器，了解用途与分类，再前往「一席茶清单」勾选本次所需器物。
        </p>
      </div>
      <q-btn
        color="primary"
        icon="checklist"
        label="去勾选清单"
        unelevated
        class="no-print"
        @click="goToSession"
      />
    </div>

    <div class="search-container q-mb-md no-print">
      <q-input
        v-model="store.searchKeyword"
        dense
        outlined
        placeholder="搜索茶器名称或描述..."
        clearable
        aria-label="搜索茶器名称或描述"
        class="search-input"
      >
        <template v-slot:prepend>
          <q-icon name="search" />
        </template>
      </q-input>
    </div>

    <div class="category-filter q-mb-lg no-print">
      <q-chip
        :color="activeCategory === '' ? 'primary' : 'grey-3'"
        :text-color="activeCategory === '' ? 'white' : 'dark'"
        clickable
        @click="setCategory('')"
      >
        全部
      </q-chip>
      <q-chip
        v-for="cat in store.categories"
        :key="cat"
        :color="activeCategory === cat ? 'primary' : 'grey-3'"
        :text-color="activeCategory === cat ? 'white' : 'dark'"
        clickable
        @click="setCategory(cat)"
      >
        {{ cat }}
      </q-chip>
    </div>

    <section
      v-for="group in filteredGroups"
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
            <div class="text-body2 text-grey-7 q-mt-xs">{{ item.desc }}</div>
          </q-card-section>

          <q-card-actions align="right" class="no-print card-actions">
            <q-btn
              :icon="favoritesStore.isFavorite(item.id) ? 'favorite' : 'favorite_border'"
              :color="favoritesStore.isFavorite(item.id) ? 'red' : 'grey'"
              flat
              dense
              round
              :aria-label="favoritesStore.isFavorite(item.id) ? '取消收藏' : '收藏'"
              @click="toggleFavorite($event, item.id)"
            />
            <q-chip
              v-if="store.isSelected(item.id)"
              color="positive"
              text-color="white"
              icon="check"
              size="sm"
            >
              已加入清单
            </q-chip>
          </q-card-actions>
        </q-card>
      </div>
    </section>

    <div v-if="hasNoResults" class="no-results q-pa-lg text-center text-grey-6">
      <q-icon name="search_off" size="48px" class="q-mb-sm" />
      <div class="text-body1">未找到匹配茶器</div>
    </div>
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

.page-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #3e2723;
}

.page-subtitle {
  max-width: 640px;
  line-height: 1.6;
}

.search-container {
  .search-input {
    max-width: 420px;
  }
}

.category-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
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
