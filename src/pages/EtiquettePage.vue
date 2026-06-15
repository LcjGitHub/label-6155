<script setup lang="ts">
import { computed } from 'vue'
import etiquetteData from '@/mock/etiquette.json'
import type { EtiquetteItem } from '@/types/etiquette'

const items = computed<EtiquetteItem[]>(() => {
  return [...etiquetteData].sort((a, b) => a.order - b.order)
})

function getItemAriaLabel(item: EtiquetteItem): string {
  return `第${item.order}条，${item.title}。${item.description}`
}
</script>

<template>
  <q-page class="etiquette-page q-pa-md">
    <div class="page-header q-mb-md">
      <div>
        <h1 class="page-title q-ma-none">茶席礼仪须知</h1>
        <p class="page-subtitle q-ma-none q-mt-xs text-grey-7">
          知礼守仪，以茶修身。了解茶席基本礼仪，让每一次品茗更加从容雅致，共{{ items.length }}条须知。
        </p>
      </div>
    </div>

    <ol class="etiquette-container" aria-label="茶席礼仪须知列表">
      <li
        v-for="item in items"
        :key="item.id"
        class="etiquette-item"
        :aria-label="getItemAriaLabel(item)"
      >
        <div class="item-number" aria-hidden="true">
          {{ item.order }}
        </div>
        <div class="item-content">
          <q-card flat bordered class="item-card">
            <q-card-section>
              <h2 class="item-title text-h6 q-ma-none">{{ item.title }}</h2>
              <p class="item-desc text-body1 text-grey-7 q-mt-sm q-ma-none">
                {{ item.description }}
              </p>
            </q-card-section>
          </q-card>
        </div>
      </li>
    </ol>
  </q-page>
</template>

<style scoped lang="scss">
.etiquette-page {
  background: #faf8f6;
}

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

.etiquette-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 720px;
  margin: 0 auto;
  list-style: none;
  padding: 0;
}

.etiquette-item {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.item-number {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8d6e63, #5d4037);
  color: white;
  font-size: 1.25rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(93, 64, 55, 0.3);
}

.item-content {
  flex: 1;
  min-width: 0;
}

.item-card {
  transition: box-shadow 0.2s ease, transform 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(62, 39, 35, 0.12);
    transform: translateY(-2px);
  }
}

.item-title {
  font-weight: 600;
  color: #3e2723;
}

.item-desc {
  line-height: 1.7;
}
</style>
