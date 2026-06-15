<script setup lang="ts">
import { computed } from 'vue'
import brewingSteps from '@/mock/brewing-steps.json'
import type { BrewingStep } from '@/types/brewing'

const steps = computed<BrewingStep[]>(() => {
  return [...brewingSteps].sort((a, b) => a.order - b.order)
})
</script>

<template>
  <q-page class="brewing-page q-pa-md">
    <div class="page-header q-mb-md">
      <div>
        <h1 class="page-title q-ma-none">泡茶步骤</h1>
        <p class="page-subtitle q-ma-none q-mt-xs text-grey-7">
          循序渐进，感受传统茶艺之美，七步泡出一壶好茶。
        </p>
      </div>
    </div>

    <div class="steps-container">
      <div
        v-for="step in steps"
        :key="step.id"
        class="step-item"
      >
        <div class="step-number">
          {{ step.order }}
        </div>
        <div class="step-content">
          <q-card flat bordered class="step-card">
            <q-card-section>
              <div class="step-title text-h6">{{ step.title }}</div>
              <div class="step-desc text-body1 text-grey-7 q-mt-sm">
                {{ step.description }}
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
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

.steps-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 720px;
  margin: 0 auto;
}

.step-item {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.step-number {
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

.step-content {
  flex: 1;
  min-width: 0;
}

.step-card {
  transition: box-shadow 0.2s ease, transform 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(62, 39, 35, 0.12);
    transform: translateY(-2px);
  }
}

.step-title {
  font-weight: 600;
  color: #3e2723;
}

.step-desc {
  line-height: 1.7;
}
</style>
