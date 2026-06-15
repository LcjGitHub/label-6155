<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useChecklistStore } from '@/stores/checklist'
import type { ChecklistSnapshot } from '@/types/teaware'

const router = useRouter()
const $q = useQuasar()
const store = useChecklistStore()

function formatDateTime(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function formatNames(names: string[], max: number = 3): string {
  if (names.length <= max) {
    return names.join('、')
  }
  const remaining = names.length - max
  return `${names.slice(0, max).join('、')}等${remaining}件`
}

function getSnapshotAriaLabel(snapshot: ChecklistSnapshot): string {
  const time = formatDateTime(snapshot.timestamp)
  const count = snapshot.teawareIds.length
  const names = snapshot.teawareNames.join('、')
  return `${time}保存的清单快照，共${count}件：${names}，按回车或空格键恢复此快照`
}

function handleItemKeydown(event: KeyboardEvent, snapshot: ChecklistSnapshot): void {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    handleRestore(snapshot)
  }
}

function goToSession(): void {
  router.push('/session')
}

function handleRestore(snapshot: ChecklistSnapshot): void {
  $q.dialog({
    title: '恢复快照',
    message: `确定要恢复「${formatDateTime(snapshot.timestamp)}」的清单快照吗？当前已选器物将被替换。`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    const success = store.restoreSnapshot(snapshot.id)
    if (success) {
      $q.notify({ type: 'positive', message: '快照已恢复' })
      router.push('/session')
    } else {
      $q.notify({ type: 'negative', message: '恢复失败，快照不存在' })
    }
  })
}

function handleDelete(snapshot: ChecklistSnapshot, event: Event): void {
  event.stopPropagation()
  $q.dialog({
    title: '删除快照',
    message: `确定要删除「${formatDateTime(snapshot.timestamp)}」的快照吗？此操作不可撤销。`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    const success = store.deleteSnapshot(snapshot.id)
    if (success) {
      $q.notify({ type: 'info', message: '快照已删除' })
    }
  })
}
</script>

<template>
  <q-page class="history-page q-pa-md">
    <div class="page-header q-mb-md">
      <div>
        <h1 class="page-title q-ma-none">快照历史</h1>
        <p class="page-subtitle q-ma-none q-mt-xs text-grey-7">
          查看你保存过的清单快照，点击可恢复勾选并跳转至清单页。
        </p>
      </div>
    </div>

    <div v-if="store.snapshotCount === 0" class="empty-state q-py-xl">
      <q-icon name="history" size="5rem" color="grey-4" aria-hidden="true" />
      <p class="text-grey-6 q-mt-md">还没有保存的快照</p>
      <p class="text-grey-5 text-body2 q-mt-xs">
        去<span class="text-primary cursor-pointer" @click="goToSession">清单页</span>勾选器物后保存快照吧
      </p>
    </div>

    <q-list v-else bordered separator class="rounded-borders snapshot-list">
      <q-item
        v-for="snapshot in store.snapshots"
        :key="snapshot.id"
        tabindex="0"
        role="button"
        :aria-label="getSnapshotAriaLabel(snapshot)"
        clickable
        v-ripple
        class="snapshot-item"
        @click="handleRestore(snapshot)"
        @keydown="handleItemKeydown($event, snapshot)"
      >
        <q-item-section avatar>
          <q-avatar color="brown-2" text-color="brown-9" size="48px" icon="inventory_2" aria-hidden="true" />
        </q-item-section>

        <q-item-section>
          <q-item-label class="snapshot-time">
            {{ formatDateTime(snapshot.timestamp) }}
          </q-item-label>
          <q-item-label caption class="snapshot-summary">
            共 {{ snapshot.teawareIds.length }} 件：{{ formatNames(snapshot.teawareNames) }}
          </q-item-label>
        </q-item-section>

        <q-item-section side class="no-print">
          <q-btn
            flat
            round
            dense
            icon="delete_outline"
            color="grey"
            aria-label="删除快照"
            role="button"
            @click="handleDelete(snapshot, $event)"
          />
        </q-item-section>
      </q-item>
    </q-list>
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

.empty-state {
  text-align: center;
}

.snapshot-list {
  max-width: 800px;
}

.snapshot-item {
  min-height: 72px;

  &:focus-visible {
    outline: 2px solid #8d6e63;
    outline-offset: 2px;
  }
}

.snapshot-time {
  font-weight: 600;
  color: #3e2723;
}

.snapshot-summary {
  margin-top: 4px;
}
</style>
