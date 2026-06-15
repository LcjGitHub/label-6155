<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useChecklistStore } from '@/stores/checklist'

const router = useRouter()
const $q = useQuasar()
const store = useChecklistStore()

/**
 * 获取预设方案包含的器物详情列表。
 * @param presetId - 预设方案 id
 */
function getPresetTeaware(presetId: string) {
  const preset = store.presets.find((p) => p.id === presetId)
  if (!preset) return []
  return store.items.filter((item) => preset.teawareIds.includes(item.id))
}

/**
 * 套用预设方案并跳转到清单页。
 * @param presetId - 预设方案 id
 * @param presetName - 预设方案名称
 */
function applyPresetAndGo(presetId: string, presetName: string): void {
  store.applyPreset(presetId)
  $q.notify({
    type: 'positive',
    message: `已套用「${presetName}」方案`,
  })
  router.push('/session')
}

/**
 * 键盘事件处理：回车/空格键套用方案
 * @param event - 键盘事件
 * @param presetId - 预设方案 id
 * @param presetName - 预设方案名称
 */
function handleCardKeydown(
  event: KeyboardEvent,
  presetId: string,
  presetName: string,
): void {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    applyPresetAndGo(presetId, presetName)
  }
}
</script>

<template>
  <q-page class="preset-page q-pa-md">
    <div class="page-header q-mb-md">
      <div>
        <h1 class="page-title q-ma-none">茶席方案预设</h1>
        <p class="page-subtitle q-ma-none q-mt-xs text-grey-7">
          精选三套经典茶席搭配方案，一键套用，快速生成您的专属器物清单。
        </p>
      </div>
    </div>

    <div class="preset-grid">
      <q-card
        v-for="preset in store.presets"
        :key="preset.id"
        flat
        bordered
        tabindex="0"
        role="button"
        :aria-label="`套用${preset.name}方案`"
        class="preset-card clickable-card"
        @click="applyPresetAndGo(preset.id, preset.name)"
        @keydown="handleCardKeydown($event, preset.id, preset.name)"
      >
        <q-img :src="preset.coverImage" :ratio="16 / 9" class="preset-cover">
          <div class="absolute-bottom text-subtitle2 preset-cover-label">
            {{ getPresetTeaware(preset.id).length }} 件器物
          </div>
        </q-img>

        <q-card-section>
          <div class="text-h6">{{ preset.name }}</div>
          <div class="text-body2 text-grey-7 q-mt-xs">{{ preset.desc }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="teaware-tags">
            <q-chip
              v-for="item in getPresetTeaware(preset.id)"
              :key="item.id"
              size="sm"
              color="brown-1"
              text-color="brown-9"
              class="no-pointer-events"
            >
              {{ item.name }}
            </q-chip>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="no-print">
          <q-btn
            color="primary"
            icon="checklist"
            label="套用方案"
            unelevated
            @click.stop="applyPresetAndGo(preset.id, preset.name)"
          />
        </q-card-actions>
      </q-card>
    </div>
  </q-page>
</template>

<style scoped lang="scss">
.page-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #3e2723;
}

.page-subtitle {
  max-width: 640px;
  line-height: 1.6;
}

.preset-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.preset-card {
  transition: box-shadow 0.2s ease;
  display: flex;
  flex-direction: column;

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

.preset-cover {
  background: #efebe9;
}

.preset-cover-label {
  background: rgba(62, 39, 35, 0.65);
}

.teaware-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.no-pointer-events {
  pointer-events: none;
}
</style>
