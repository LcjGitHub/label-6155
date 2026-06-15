<script setup lang="ts">
import { onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useChecklistStore } from '@/stores/checklist'

const $q = useQuasar()
const store = useChecklistStore()

onMounted(() => {
  if (store.restoredFromStorage) {
    $q.notify({ type: 'info', message: '已恢复上次勾选' })
    store.resetRestoredFlag()
  }
})

/**
 * 触发浏览器打印。
 */
function printChecklist(): void {
  window.print()
}

/**
 * 清空已选并提示。
 */
function handleClear(): void {
  if (store.selectedCount === 0) {
    return
  }
  $q.dialog({
    title: '清空清单',
    message: '确定要清空所有已选器物吗？',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    store.clearSelection()
    $q.notify({ type: 'info', message: '清单已清空' })
  })
}

/**
 * 保存当前清单为快照。
 */
function handleSaveSnapshot(): void {
  const snapshot = store.saveSnapshot()
  if (snapshot) {
    $q.notify({ type: 'positive', message: '快照已保存' })
  } else {
    $q.notify({ type: 'warning', message: '清单为空，无法保存' })
  }
}

/**
 * 批量勾选指定分类下的所有器物
 * @param category - 分类名称
 */
function selectAllByCategory(category: string): void {
  store.selectAllByCategory(category)
}

/**
 * 批量取消指定分类下的所有器物勾选
 * @param category - 分类名称
 */
function clearByCategory(category: string): void {
  store.clearByCategory(category)
}
</script>

<template>
  <q-page class="session-page q-pa-md">
    <!-- 操作栏：打印时隐藏 -->
    <div class="session-toolbar q-mb-md no-print">
      <div>
        <h1 class="page-title q-ma-none">一席茶清单</h1>
        <p class="page-subtitle q-ma-none q-mt-xs text-grey-7">
          勾选本次茶席所需器物，生成可打印清单。
        </p>
      </div>
      <div class="toolbar-actions">
        <q-btn
          flat
          color="negative"
          icon="delete_outline"
          label="清空"
          :disable="store.selectedCount === 0"
          @click="handleClear"
        />
        <q-btn
          flat
          color="secondary"
          icon="save"
          label="保存快照"
          :disable="store.selectedCount === 0"
          @click="handleSaveSnapshot"
        />
        <q-btn
          color="primary"
          icon="print"
          label="打印清单"
          unelevated
          :disable="store.selectedCount === 0"
          @click="printChecklist"
        />
      </div>
    </div>

    <!-- 打印专用清单：仅打印时显示已选器物 -->
    <section class="print-checklist print-only">
      <div class="print-header">
        <h1>一席茶 · 器物清单</h1>
        <p>共 {{ store.selectedCount }} 件 · {{ new Date().toLocaleDateString('zh-CN') }}</p>
      </div>
      <ol v-if="store.selectedCount > 0" class="print-list">
        <li v-for="item in store.selectedItems" :key="item.id">
          <strong>{{ item.name }}</strong>
          <span class="print-category">（{{ item.category }}）</span>
          <p class="print-desc">{{ item.desc }}</p>
        </li>
      </ol>
      <p v-else>暂无已选器物</p>
    </section>

    <!-- 已选统计 -->
    <q-banner
      rounded
      class="bg-brown-1 text-brown-9 q-mb-md selected-summary"
      :class="{ 'summary-empty': store.selectedCount === 0 }"
    >
      <template #avatar>
        <q-icon name="inventory_2" color="brown" />
      </template>
      <span v-if="store.selectedCount > 0">
        已选 <strong>{{ store.selectedCount }}</strong> 件器物
      </span>
      <span v-else>尚未勾选任何器物，请在下方列表中勾选</span>
    </q-banner>

    <div class="session-layout">
      <!-- 左侧：勾选列表（QList + QCheckbox） -->
      <section class="picker-section">
        <h2 class="section-title">勾选器物</h2>

        <div
          v-for="group in store.groupedItems"
          :key="group.category"
          class="group-block q-mb-md"
        >
          <div class="group-header">
            <div class="group-label">{{ group.category }}</div>
            <div class="group-actions no-print">
              <q-btn
                color="primary"
                icon="check_circle"
                label="本类全选"
                size="sm"
                flat
                dense
                :aria-label="`本类全选：${group.category}`"
                @click="selectAllByCategory(group.category)"
              />
              <q-btn
                color="grey"
                icon="cancel"
                label="本类清空"
                size="sm"
                flat
                dense
                :aria-label="`本类清空：${group.category}`"
                @click="clearByCategory(group.category)"
              />
            </div>
          </div>

          <q-list bordered separator class="rounded-borders">
            <q-item
              v-for="item in group.items"
              :key="item.id"
              clickable
              v-ripple
              @click="store.toggleItem(item.id)"
            >
              <q-item-section avatar class="no-print">
                <q-checkbox
                  :model-value="store.isSelected(item.id)"
                  color="primary"
                  @update:model-value="store.toggleItem(item.id)"
                  @click.stop
                />
              </q-item-section>

              <q-item-section avatar>
                <q-avatar rounded size="48px">
                  <img :src="item.image" :alt="item.name" />
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label>{{ item.name }}</q-item-label>
                <q-item-label caption>{{ item.desc }}</q-item-label>
              </q-item-section>

            </q-item>
          </q-list>
        </div>
      </section>

      <!-- 右侧：已选清单摘要 -->
      <aside class="summary-section">
        <h2 class="section-title">清单列表</h2>

        <q-card flat bordered class="summary-card">
          <q-card-section v-if="store.selectedCount === 0" class="text-grey-6">
            清单为空，请从左侧勾选器物。
          </q-card-section>

          <q-list v-else separator>
            <q-item
              v-for="(item, index) in store.selectedItems"
              :key="item.id"
              class="selected-item"
            >
              <q-item-section avatar>
                <q-avatar color="brown-2" text-color="brown-9" size="32px">
                  {{ index + 1 }}
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ item.name }}</q-item-label>
                <q-item-label caption>{{ item.category }}</q-item-label>
              </q-item-section>
              <q-item-section side class="no-print">
                <q-btn
                  flat
                  round
                  dense
                  icon="close"
                  color="grey"
                  @click="store.toggleItem(item.id)"
                />
              </q-item-section>
            </q-item>
          </q-list>

          <q-separator v-if="store.selectedCount > 0" />

          <q-card-section v-if="store.selectedCount > 0" class="summary-footer">
            合计：<strong>{{ store.selectedCount }}</strong> 件
          </q-card-section>
        </q-card>
      </aside>
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
  line-height: 1.6;
}

.session-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.toolbar-actions {
  display: flex;
  gap: 8px;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #5d4037;
  margin: 0 0 12px;
}

.group-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #8d6e63;
  margin-bottom: 8px;
}

.group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
  flex-wrap: wrap;

  .group-label {
    margin-bottom: 0;
  }
}

.group-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.session-layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 24px;
  align-items: start;
}

.summary-card {
  position: sticky;
  top: 80px;
}

.summary-footer {
  text-align: right;
  color: #5d4037;
}

.print-list {
  padding-left: 1.25rem;
  margin: 0;

  li {
    margin-bottom: 12px;
    page-break-inside: avoid;
  }
}

.print-category {
  color: #666;
  font-size: 0.9rem;
}

.print-desc {
  margin: 4px 0 0;
  color: #555;
  font-size: 0.85rem;
}

@media (max-width: 900px) {
  .session-layout {
    grid-template-columns: 1fr;
  }

  .summary-card {
    position: static;
  }
}
</style>
