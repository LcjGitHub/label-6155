<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useChecklistStore } from '@/stores/checklist'

const route = useRoute()
const router = useRouter()
const store = useChecklistStore()

const teawareId = computed(() => route.params.id as string)

const teaware = computed(() =>
  store.items.find((item) => item.id === teawareId.value),
)

function goBack(): void {
  router.push({ name: 'catalog' })
}
</script>

<template>
  <q-page class="teaware-detail-page q-pa-md">
    <div class="detail-container">
      <q-btn
        v-if="teaware"
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
</style>
