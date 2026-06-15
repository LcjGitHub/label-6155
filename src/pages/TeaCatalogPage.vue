<script setup lang="ts">
import { computed, ref } from 'vue'
import teaData from '@/mock/tea.json'
import type { TeaItem } from '@/types/tea'
import { groupTeaByCategory } from '@/utils/tea'

const items = ref<TeaItem[]>(teaData as TeaItem[])

const activeCategory = ref('')

const categories = computed(() => {
  const unique = new Set<string>()
  items.value.forEach((item) => unique.add(item.category))
  return Array.from(unique)
})

const groupedItems = computed(() => groupTeaByCategory(items.value))

const filteredGroups = computed(() => {
  if (!activeCategory.value) {
    return groupedItems.value
  }
  return groupedItems.value.filter(
    (group) => group.category === activeCategory.value,
  )
})

const hasNoResults = computed(
  () => filteredGroups.value.length === 0 && activeCategory.value !== '',
)

/**
 * 设置分类筛选。
 * @param category - 分类名，空字符串为全部
 */
function setCategory(category: string): void {
  activeCategory.value = category
}
</script>

<template>
  <q-page class="tea-catalog-page q-pa-md">
    <div class="page-header q-mb-md">
      <div>
        <h1 class="page-title q-ma-none">茶叶品种图鉴</h1>
        <p class="page-subtitle q-ma-none q-mt-xs text-grey-7">
          浏览中国六大茶类代表品种，了解产地与特点，品味茶文化之美。
        </p>
      </div>
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
        v-for="cat in categories"
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
      <div class="category-header">
        <h2 class="category-title q-ma-none">{{ group.category }}</h2>
      </div>

      <div class="tea-grid">
        <q-card
          v-for="item in group.items"
          :key="item.id"
          flat
          bordered
          class="tea-card"
        >
          <q-img :src="item.image" :ratio="4 / 3" class="tea-image">
            <div class="absolute-bottom text-subtitle2 tea-image-label">
              {{ item.category }}
            </div>
          </q-img>

          <q-card-section>
            <div class="text-h6">{{ item.name }}</div>
            <div class="text-caption text-primary q-mt-xs">
              <q-icon name="location_on" size="12px" class="q-mr-xs" />
              {{ item.origin }}
            </div>
            <div class="text-body2 text-grey-7 q-mt-sm">{{ item.desc }}</div>
          </q-card-section>
        </q-card>
      </div>
    </section>

    <div v-if="hasNoResults" class="no-results q-pa-lg text-center text-grey-6">
      <q-icon name="search_off" size="48px" class="q-mb-sm" />
      <div class="text-body1">未找到匹配茶叶</div>
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

.category-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.category-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #5d4037;
  margin: 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #d7ccc8;
}

.category-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #d7ccc8;
  flex-wrap: wrap;

  .category-title {
    border-bottom: none;
    padding-bottom: 0;
    margin-bottom: 0;
  }
}

.tea-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.tea-card {
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(62, 39, 35, 0.12);
  }
}

.tea-image-label {
  background: rgba(62, 39, 35, 0.65);
}
</style>
