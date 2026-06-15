<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import brewingSteps from '@/mock/brewing-steps.json'
import type { BrewingStep } from '@/types/brewing'

const $q = useQuasar()

const steps = computed<BrewingStep[]>(() => {
  return [...brewingSteps].sort((a, b) => a.order - b.order)
})

const activeStepId = ref<string | null>(null)
const remainingSeconds = ref<number>(0)
let timerInterval: number | null = null

function getStepAriaLabel(step: BrewingStep): string {
  return `第${step.order}步，${step.title}。${step.description}`
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

function stopTimer(): void {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
  activeStepId.value = null
  remainingSeconds.value = 0
}

function startTimer(step: BrewingStep): void {
  if (activeStepId.value === step.id) {
    stopTimer()
    return
  }

  if (activeStepId.value) {
    stopTimer()
  }

  activeStepId.value = step.id
  remainingSeconds.value = step.defaultDuration

  timerInterval = window.setInterval(() => {
    remainingSeconds.value--
    if (remainingSeconds.value <= 0) {
      stopTimer()
      $q.dialog({
        title: '计时结束',
        message: `「${step.title}」步骤计时已完成，请进行下一步操作。`,
        ok: '知道了',
        persistent: true
      })
    }
  }, 1000)
}

function getStepTimerStatus(step: BrewingStep): string {
  if (activeStepId.value !== step.id) {
    return `默认时长 ${formatTime(step.defaultDuration)}`
  }
  return `剩余 ${formatTime(remainingSeconds.value)}`
}

onUnmounted(() => {
  stopTimer()
})
</script>

<template>
  <q-page class="brewing-page q-pa-md">
    <div class="page-header q-mb-md">
      <div>
        <h1 class="page-title q-ma-none">泡茶步骤</h1>
        <p class="page-subtitle q-ma-none q-mt-xs text-grey-7">
          循序渐进，感受传统茶艺之美，{{ steps.length }}步泡出一壶好茶。
        </p>
      </div>
    </div>

    <ol class="steps-container" aria-label="泡茶步骤列表">
      <li
        v-for="step in steps"
        :key="step.id"
        class="step-item"
        :aria-label="getStepAriaLabel(step)"
      >
        <div class="step-number" aria-hidden="true">
          {{ step.order }}
        </div>
        <div class="step-content">
          <q-card flat bordered class="step-card">
            <q-card-section>
              <h2 class="step-title text-h6 q-ma-none">{{ step.title }}</h2>
              <p class="step-desc text-body1 text-grey-7 q-mt-sm q-ma-none">
                {{ step.description }}
              </p>
              <div class="step-timer q-mt-md row items-center justify-between">
                <span class="timer-display text-body2 text-grey-6">
                  {{ getStepTimerStatus(step) }}
                </span>
                <q-btn
                  :label="activeStepId === step.id ? '停止计时' : '开始计时'"
                  :color="activeStepId === step.id ? 'negative' : 'primary'"
                  size="sm"
                  dense
                  @click="startTimer(step)"
                />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </li>
    </ol>
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
  list-style: none;
  padding: 0;
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

.step-timer {
  padding-top: 12px;
  border-top: 1px solid rgba(93, 64, 55, 0.1);
}

.timer-display {
  font-variant-numeric: tabular-nums;
  font-weight: 500;
}
</style>
