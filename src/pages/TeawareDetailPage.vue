<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useChecklistStore } from '@/stores/checklist'
import teawareData from '@/mock/teaware.json'
import type { TeawareItem } from '@/types/teaware'

const route = useRoute()
const router = useRouter()
const store = useChecklistStore()

const teawareId = computed(() => route.params.id as string)

const teaware = computed(() =>
  store.items.find((item) => item.id === teawareId.value),
)

const relatedTeaware = computed<TeawareItem[]>(() => {
  if (!teaware.value) return []
  return (teawareData as TeawareItem[])
    .filter((item) => item.category === teaware.value!.category && item.id !== teaware.value!.id)
    .slice(0, 4)
})

function goBack(): void {
  router.push({ name: 'catalog' })
}

function goToDetail(id: string): void {
  router.push({ name: 'teaware-detail', params: { id } })
}

function handleCardKeydown(event: KeyboardEvent, id: string): void {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    goToDetail(id)
  }
}
</script>

<template>
  <q-page class="teaware-detail-page q-pa-md">
    <div class="detail-container">
      <q-btn
        flat
        dense
        icon="arrow_back"
        label="返回图鉴"
        class="back-btn q-mb-lg no-print"
        @click="goBack"
      />

      <template v-if="teaware">
        <div class="detail-card">
          <div class="image-wrapper">
            <q-img
              :src="teaware.image"
              :ratio="4 / 3"
              class="detail-image"
              fit="contain"
            />
          </div>

          <div class="detail-content">
            <div class="detail-header">
              <q-chip color="primary" text-color="white" size="md">
                {{ teaware.category }}
              </q-chip>
              <span class="teaware-id text-caption text-grey-6">
                编号：{{ teaware.id }}
              </span>
            </div>

            <h1 class="detail-title">{{ teaware.name }}</h1>

            <p class="detail-desc text-body1">{{ teaware.desc }}</p>

            <div class="detail-actions no-print q-mt-lg">
              <q-btn
                color="primary"
                icon="arrow_back"
                label="返回图鉴"
                unelevated
                @click="goBack"
              />
            </div>
          </div>
        </div>

        <section v-if="relatedTeaware.length > 0" class="related-section q-mt-xl">
          <h2 class="related-title">同类器物</h2>
          <div class="related-grid">
            <q-card
              v-for="item in relatedTeaware"
              :key="item.id"
              flat
              bordered
              tabindex="0"
              role="button"
              :aria-label="`查看${item.name}详情`"
              class="related-card clickable-card"
              @click="goToDetail(item.id)"
              @keydown="handleCardKeydown($event, item.id)"
            >
              <q-img :src="item.image" :ratio="4 / 3" class="related-image" fit="contain" />
              <q-card-section class="related-card-content">
                <div class="related-name">{{ item.name }}</div>
              </q-card-section>
            </q-card>
          </div>
        </section>
      </template>

      <template v-else>
        <div class="not-found text-center q-py-xl">
          <q-icon
            name="error_outline"
            size="80px"
            color="grey-5"
            class="q-mb-md"
          />
          <h2 class="text-h5 text-grey-8 q-mb-sm">未找到该茶器</h2>
          <p class="text-body1 text-grey-6 q-mb-lg">
            编号「{{ teawareId }}」对应的茶器不存在或已被移除。
          </p>
          <q-btn
            color="primary"
            icon="arrow_back"
            label="返回图鉴"
            unelevated
            @click="goBack"
          />
        </div>
      </template>
    </div>
  </q-page>
</template>

<style scoped lang="scss">
.detail-container {
  max-width: 900px;
  margin: 0 auto;
}

.back-btn {
  color: #5d4037;
}

.detail-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(62, 39, 35, 0.08);
}

.image-wrapper {
  background: #faf6f3;
  padding: 24px;
}

.detail-image {
  border-radius: 8px;
  background: white;
}

.detail-content {
  padding: 24px;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.teaware-id {
  font-family: monospace;
}

.detail-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #3e2723;
  margin: 0 0 16px;
}

.detail-desc {
  line-height: 1.8;
  color: #4e342e;
  margin: 0;
}

.detail-actions {
  display: flex;
  gap: 12px;
}

.not-found {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(62, 39, 35, 0.08);
}

.related-section {
  .related-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #5d4037;
    margin: 0 0 16px;
    padding-bottom: 8px;
    border-bottom: 2px solid #d7ccc8;
  }

  .related-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
  }

  .related-card {
    transition: box-shadow 0.2s ease;

    &:hover {
      box-shadow: 0 4px 12px rgba(62, 39, 35, 0.12);
    }

    &:focus-visible {
      outline: 2px solid #8d6e63;
      outline-offset: 2px;
    }
  }

  .related-image {
    background: #faf6f3;
  }

  .related-card-content {
    padding: 10px 12px;
  }

  .related-name {
    font-size: 0.875rem;
    font-weight: 500;
    color: #3e2723;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.clickable-card {
  cursor: pointer;
}
</style>
