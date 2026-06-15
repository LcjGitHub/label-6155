<script setup lang="ts">
import { computed, ref } from 'vue'
import scaleData from '@/mock/scale-estimation.json'
import type { ScaleTier, TeawareItem } from '@/types/scale-estimation'

const tiers = scaleData as ScaleTier[]

const selectedTierId = ref<string>(tiers[0]?.id ?? '')

const selectedTier = computed<ScaleTier | undefined>(() => {
  return tiers.find((t) => t.id === selectedTierId.value)
})

const groupedItems = computed<{ category: string; items: TeawareItem[] }[]>(() => {
  if (!selectedTier.value) return []
  const map = new Map<string, TeawareItem[]>()
  for (const item of selectedTier.value.items) {
    if (!map.has(item.category)) {
      map.set(item.category, [])
    }
    map.get(item.category)!.push(item)
  }
  return Array.from(map.entries()).map(([category, items]) => ({ category, items }))
})

const totalCount = computed<number>(() => {
  if (!selectedTier.value) return 0
  return selectedTier.value.items.reduce((sum, item) => sum + item.quantity, 0)
})

const categoryCount = computed<number>(() => groupedItems.value.length)

function getTierIcon(id: string): string {
  const map: Record<string, string> = {
    solo: 'person',
    small: 'group',
    medium: 'family_restroom',
    large: 'diversity_3',
    xlarge: 'celebration',
  }
  return map[id] ?? 'groups'
}

function getItemIcon(name: string): string {
  if (name.includes('壶') || name.includes('茶壶')) return 'local_cafe'
  if (name.includes('盖碗')) return 'coffee'
  if (name.includes('公道') || name.includes('茶海')) return 'wine_bar'
  if (name.includes('滤')) return 'filter_alt'
  if (name.includes('杯') || name.includes('盏')) return 'local_drink'
  if (name.includes('盘') || name.includes('承')) return 'table_restaurant'
  if (name.includes('茶则') || name.includes('茶荷')) return 'restaurant'
  if (name.includes('针') || name.includes('刀')) return 'construction'
  if (name.includes('夹')) return 'content_cut'
  if (name.includes('道') || name.includes('组')) return 'list'
  if (name.includes('巾')) return 'dry_cleaning'
  if (name.includes('水盂') || name.includes('建水')) return 'bowl'
  if (name.includes('煮水') || name.includes('保温')) return 'water_drop'
  if (name.includes('罐') || name.includes('存')) return 'inventory'
  if (name.includes('宠')) return 'pets'
  if (name.includes('炉') || name.includes('香')) return 'local_fire_department'
  if (name.includes('花')) return 'local_florist'
  if (name.includes('席') || name.includes('布')) return 'table_bar'
  if (name.includes('托')) return 'density_small'
  if (name.includes('样') || name.includes('碟')) return 'breakfast_dining'
  if (name.includes('笔')) return 'brush'
  if (name.includes('茶')) return 'emoji_food_beverage'
  return 'restaurant'
}
</script>

<template>
  <q-page class="scale-estimation-page q-pa-md">
    <div class="page-header q-mb-md">
      <div>
        <h1 class="page-title q-ma-none">茶席规模估算</h1>
        <p class="page-subtitle q-ma-none q-mt-xs text-grey-7">
          根据参与人数选择合适档位，快速估算所需茶器种类与数量，为茶席筹备提供参考。
        </p>
      </div>
    </div>

    <div class="selector-card q-mb-lg">
      <q-card flat bordered class="bg-brown-1">
        <q-card-section>
          <div class="selector-row">
            <div class="selector-label">
              <q-icon name="groups" color="brown" class="q-mr-sm" />
              <span class="text-weight-medium text-brown-9">选择参与人数</span>
            </div>
            <q-select
              v-model="selectedTierId"
              :options="tiers"
              option-value="id"
              option-label="label"
              emit-value
              map-options
              dense
              outlined
              bg-color="white"
              class="selector-select"
              aria-label="选择人数档位"
            >
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section>
                    <q-item-label>{{ scope.opt.label }}</q-item-label>
                    <q-item-label caption>{{ scope.opt.peopleCount }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>

          <q-banner v-if="selectedTier" rounded class="bg-white text-brown-9 q-mt-md tier-description">
            <template #avatar>
              <q-icon :name="getTierIcon(selectedTier.id)" color="primary" />
            </template>
            <div>
              <div class="text-weight-medium q-mb-xs">
                {{ selectedTier.label }} · {{ selectedTier.peopleCount }}
              </div>
              <div class="text-body2">{{ selectedTier.description }}</div>
            </div>
          </q-banner>
        </q-card-section>
      </q-card>
    </div>

    <div v-if="selectedTier" class="summary-row q-mb-md">
      <q-badge color="primary" text-color="white" class="summary-badge">
        <q-icon name="category" size="14px" class="q-mr-xs" />
        {{ categoryCount }} 类器物
      </q-badge>
      <q-badge color="accent" text-color="white" class="summary-badge">
        <q-icon name="inventory_2" size="14px" class="q-mr-xs" />
        共 {{ totalCount }} 件
      </q-badge>
    </div>

    <section v-if="selectedTier" class="items-section">
      <div
        v-for="group in groupedItems"
        :key="group.category"
        class="category-group q-mb-lg"
      >
        <div class="category-header">
          <h2 class="category-title q-ma-none">
            <q-icon name="local_offer" size="18px" class="q-mr-sm" />
            {{ group.category }}
            <q-badge
              color="brown-3"
              text-color="white"
              class="q-ml-sm"
              style="vertical-align: middle"
            >
              {{ group.items.reduce((s, i) => s + i.quantity, 0) }} 件
            </q-badge>
          </h2>
        </div>

        <q-list bordered separator class="items-list">
          <q-item
            v-for="(item, idx) in group.items"
            :key="`${group.category}-${idx}`"
            class="item-row"
          >
            <q-item-section avatar>
              <q-avatar size="36px" color="brown-1" text-color="brown-9" rounded>
                <q-icon :name="getItemIcon(item.name)" size="20px" />
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label class="item-name">{{ item.name }}</q-item-label>
              <q-item-label caption v-if="item.remark" class="item-remark">
                {{ item.remark }}
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-chip color="primary" text-color="white" size="md" dense square>
                × {{ item.quantity }}
              </q-chip>
            </q-item-section>
          </q-item>
        </q-list>
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

.page-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #3e2723;
}

.page-subtitle {
  max-width: 640px;
  line-height: 1.6;
}

.selector-card {
  max-width: 720px;
}

.selector-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
}

.selector-label {
  display: flex;
  align-items: center;
  font-size: 1rem;
  flex-shrink: 0;
}

.selector-select {
  flex: 1;
  min-width: 280px;
}

.tier-description {
  .q-banner__avatar {
    align-self: flex-start;
    padding-top: 4px;
  }
}

.summary-row {
  display: flex;
  gap: 12px;
  align-items: center;
}

.summary-badge {
  font-size: 0.875rem;
  padding: 8px 14px;
  border-radius: 20px;
  display: inline-flex;
  align-items: center;
}

.category-header {
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid #d7ccc8;
}

.category-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #5d4037;
  margin: 0;
  display: flex;
  align-items: center;
}

.items-list {
  border-radius: 8px;
  overflow: hidden;
}

.item-row {
  padding: 12px 16px;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: #fafafa;
  }
}

.item-name {
  font-size: 1rem;
  font-weight: 500;
  color: #3e2723;
}

.item-remark {
  color: #6d4c41;
}

.category-group {
  max-width: 800px;
}
</style>
