<script setup lang="ts">
import { computed, ref } from 'vue'
import teaWaterData from '@/mock/tea-water.json'
import type { TeaWaterGuide } from '@/types/tea-water'

const teaWaterList = ref<TeaWaterGuide[]>(teaWaterData as TeaWaterGuide[])

const activeCategory = ref('')

const categories = computed(() => {
  const cats = new Set<string>()
  teaWaterList.value.forEach((item) => cats.add(item.category))
  return Array.from(cats)
})

const filteredItems = computed(() => {
  if (!activeCategory.value) {
    return teaWaterList.value
  }
  return teaWaterList.value.filter((item) => item.category === activeCategory.value)
})

function setCategory(category: string): void {
  activeCategory.value = category
}

function formatTempRange(min: number, max: number): string {
  return `${min}℃ - ${max}℃`
}

function getTempLevel(min: number): string {
  if (min >= 95) return 'high'
  if (min >= 85) return 'medium-high'
  if (min >= 80) return 'medium'
  return 'low'
}
</script>

<template>
  <q-page class="water-guide-page q-pa-md">
    <div class="page-header q-mb-md">
      <div>
        <h1 class="page-title q-ma-none">水温指引</h1>
        <p class="page-subtitle q-ma-none q-mt-xs text-grey-7">
          了解不同茶类的最佳冲泡水温，让每一杯茶都恰到好处。
        </p>
      </div>
    </div>

    <div class="category-filter q-mb-lg">
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

    <div class="tea-card-grid">
      <q-card
        v-for="item in filteredItems"
        :key="item.id"
        flat
        bordered
        class="tea-water-card"
      >
        <div class="card-header" :class="`temp-${getTempLevel(item.minTemp)}`">
          <div class="tea-name">{{ item.name }}</div>
          <div class="tea-category">{{ item.category }}</div>
        </div>

        <q-card-section>
          <div class="temp-section">
            <q-icon name="thermostat" class="temp-icon" />
            <div class="temp-range">
              {{ formatTempRange(item.minTemp, item.maxTemp) }}
            </div>
          </div>

          <div class="temp-bar">
            <div
              class="temp-fill"
              :style="{
                left: `${(item.minTemp - 70) / 30 * 100}%`,
                width: `${(item.maxTemp - item.minTemp) / 30 * 100}%`,
              }"
              :class="`temp-fill-${getTempLevel(item.minTemp)}`"
            ></div>
            <div class="temp-scale">
              <span>70℃</span>
              <span>85℃</span>
              <span>100℃</span>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div class="desc-label">
            <q-icon name="info" size="sm" class="q-mr-xs" />
            冲泡说明
          </div>
          <p class="desc-text">{{ item.description }}</p>

          <div class="tips-label q-mt-sm">
            <q-icon name="lightbulb" size="sm" class="q-mr-xs" />
            小贴士
          </div>
          <p class="tips-text">{{ item.tips }}</p>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<style scoped lang="scss">
.water-guide-page {
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

.category-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tea-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.tea-water-card {
  transition: box-shadow 0.2s ease, transform 0.2s ease;
  overflow: hidden;

  &:hover {
    box-shadow: 0 6px 20px rgba(62, 39, 35, 0.15);
    transform: translateY(-2px);
  }
}

.card-header {
  padding: 20px;
  color: white;
  text-align: center;

  &.temp-low {
    background: linear-gradient(135deg, #4fc3f7, #29b6f6);
  }

  &.temp-medium {
    background: linear-gradient(135deg, #66bb6a, #43a047);
  }

  &.temp-medium-high {
    background: linear-gradient(135deg, #ffa726, #fb8c00);
  }

  &.temp-high {
    background: linear-gradient(135deg, #ef5350, #e53935);
  }
}

.tea-name {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 4px;
}

.tea-category {
  font-size: 0.875rem;
  opacity: 0.9;
}

.temp-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 16px;
}

.temp-icon {
  font-size: 1.75rem;
  color: #d84315;
}

.temp-range {
  font-size: 1.5rem;
  font-weight: 600;
  color: #d84315;
}

.temp-bar {
  position: relative;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  margin-bottom: 8px;
}

.temp-fill {
  position: absolute;
  top: 0;
  height: 100%;
  border-radius: 4px;

  &.temp-fill-low {
    background: linear-gradient(90deg, #4fc3f7, #29b6f6);
  }

  &.temp-fill-medium {
    background: linear-gradient(90deg, #66bb6a, #43a047);
  }

  &.temp-fill-medium-high {
    background: linear-gradient(90deg, #ffa726, #fb8c00);
  }

  &.temp-fill-high {
    background: linear-gradient(90deg, #ef5350, #e53935);
  }
}

.temp-scale {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #9e9e9e;
}

.desc-label,
.tips-label {
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  font-weight: 600;
  color: #5d4037;
}

.desc-text {
  margin: 8px 0 0;
  font-size: 0.9375rem;
  line-height: 1.6;
  color: #424242;
}

.tips-text {
  margin: 8px 0 0;
  font-size: 0.875rem;
  line-height: 1.6;
  color: #616161;
  padding-left: 4px;
  border-left: 3px solid #ffb74d;
  padding-left: 10px;
}
</style>
