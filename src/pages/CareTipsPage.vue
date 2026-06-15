<script setup lang="ts">
import { ref } from 'vue'
import careTipsData from '@/mock/care-tips.json'
import type { CareTipCategory } from '@/types/care-tips'

const careTips = ref<CareTipCategory[]>(careTipsData as CareTipCategory[])

const expandedCategories = ref<string[]>([])
const expandedTips = ref<string[]>([])

function toggleCategory(category: string): void {
  const index = expandedCategories.value.indexOf(category)
  if (index === -1) {
    expandedCategories.value.push(category)
  } else {
    expandedCategories.value.splice(index, 1)
  }
}

function isCategoryExpanded(category: string): boolean {
  return expandedCategories.value.includes(category)
}

function toggleTip(tipId: string): void {
  const index = expandedTips.value.indexOf(tipId)
  if (index === -1) {
    expandedTips.value.push(tipId)
  } else {
    expandedTips.value.splice(index, 1)
  }
}

function isTipExpanded(tipId: string): boolean {
  return expandedTips.value.includes(tipId)
}

function expandAll(): void {
  careTips.value.forEach((category) => {
    if (!expandedCategories.value.includes(category.category)) {
      expandedCategories.value.push(category.category)
    }
    category.tips.forEach((tip) => {
      if (!expandedTips.value.includes(tip.id)) {
        expandedTips.value.push(tip.id)
      }
    })
  })
}

function collapseAll(): void {
  expandedCategories.value = []
  expandedTips.value = []
}
</script>

<template>
  <q-page class="care-tips-page q-pa-md">
    <div class="page-header q-mb-md">
      <div>
        <h1 class="page-title q-ma-none">保养贴士</h1>
        <p class="page-subtitle q-ma-none q-mt-xs text-grey-7">
          学习各类茶具的保养方法，让您的茶器历久弥新，陪伴每一次品茗时光。
        </p>
      </div>
      <div class="header-actions no-print">
        <q-btn
          flat
          color="primary"
          icon="unfold_more"
          label="全部展开"
          size="sm"
          dense
          @click="expandAll"
        />
        <q-btn
          flat
          color="grey"
          icon="unfold_less"
          label="全部收起"
          size="sm"
          dense
          @click="collapseAll"
        />
      </div>
    </div>

    <div class="tips-container">
      <q-expansion-item
        v-for="category in careTips"
        :key="category.category"
        group="categories"
        :model-value="isCategoryExpanded(category.category)"
        @update:model-value="toggleCategory(category.category)"
        icon="category"
        :label="category.category"
        :caption="`${category.tips.length} 条贴士`"
        expand-separator
        class="category-expansion"
      >
        <div class="tips-list q-pa-sm">
          <q-expansion-item
            v-for="tip in category.tips"
            :key="tip.id"
            group="tips"
            :model-value="isTipExpanded(tip.id)"
            @update:model-value="toggleTip(tip.id)"
            icon="lightbulb"
            :label="tip.title"
            expand-separator
            class="tip-expansion"
            dense
          >
            <q-card-section class="tip-content q-pa-md">
              <p class="tip-text">{{ tip.content }}</p>
            </q-card-section>
          </q-expansion-item>
        </div>
      </q-expansion-item>
    </div>
  </q-page>
</template>

<style scoped lang="scss">
.care-tips-page {
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

.header-actions {
  display: flex;
  gap: 8px;
}

.tips-container {
  max-width: 900px;
  margin: 0 auto;
}

.category-expansion {
  background: white;
  border-radius: 8px;
  margin-bottom: 12px;
  box-shadow: 0 1px 3px rgba(62, 39, 35, 0.08);
  overflow: hidden;

  :deep(.q-expansion-item__container) {
    .q-expansion-item__label {
      font-size: 1.125rem;
      font-weight: 600;
      color: #5d4037;
    }

    .q-expansion-item__caption {
      color: #8d6e63;
    }
  }

  :deep(.q-expansion-item__icon) {
    color: #8d6e63;
  }
}

.tips-list {
  background: #fdfaf7;
}

.tip-expansion {
  background: white;
  border-radius: 6px;
  margin-bottom: 8px;
  border: 1px solid #efebe9;

  :deep(.q-expansion-item__container) {
    .q-expansion-item__label {
      font-size: 0.9375rem;
      font-weight: 500;
      color: #4e342e;
    }
  }

  :deep(.q-expansion-item__icon) {
    color: #ffb74d;
    font-size: 1.125rem;
  }
}

.tip-content {
  background: #fff8e1;
  border-left: 4px solid #ffb74d;
  margin: 8px;
  border-radius: 0 4px 4px 0;
}

.tip-text {
  margin: 0;
  font-size: 0.9375rem;
  line-height: 1.75;
  color: #424242;
}
</style>
