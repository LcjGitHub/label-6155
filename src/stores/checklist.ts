import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import teawareData from '@/mock/teaware.json'
import presetData from '@/mock/presets.json'
import type { TeawareItem, TeaPreset, ChecklistSnapshot } from '@/types/teaware'
import { groupItemsByCategory } from '@/utils/teaware'

const SELECTED_STORAGE_KEY = 'tea-checklist-selected'
const SNAPSHOT_STORAGE_KEY = 'tea-checklist-snapshots'
const SESSION_NAME_STORAGE_KEY = 'tea-checklist-session-name'

function loadSelectedFromStorage(): Set<string> {
  try {
    const stored = localStorage.getItem(SELECTED_STORAGE_KEY)
    if (stored) {
      return new Set(JSON.parse(stored))
    }
  } catch (e) {
    console.warn('Failed to load selected items from localStorage', e)
  }
  return new Set()
}

function loadSessionNameFromStorage(): string {
  try {
    const stored = localStorage.getItem(SESSION_NAME_STORAGE_KEY)
    if (stored) {
      return stored
    }
  } catch (e) {
    console.warn('Failed to load session name from localStorage', e)
  }
  return '一席茶'
}

function loadSnapshotsFromStorage(): ChecklistSnapshot[] {
  try {
    const stored = localStorage.getItem(SNAPSHOT_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored) as ChecklistSnapshot[]
    }
  } catch (e) {
    console.warn('Failed to load snapshots from localStorage', e)
  }
  return []
}

function generateSnapshotId(): string {
  return `snap_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

/**
 * 一席茶清单状态：勾选器物、统计数量、按分类浏览。
 */
export const useChecklistStore = defineStore('checklist', () => {
  const items = ref<TeawareItem[]>(teawareData as TeawareItem[])
  const initialSelected = loadSelectedFromStorage()
  const selectedIds = ref<Set<string>>(initialSelected)
  const restoredFromStorage = ref(initialSelected.size > 0)
  const presets = ref<TeaPreset[]>(presetData as TeaPreset[])
  const snapshots = ref<ChecklistSnapshot[]>(loadSnapshotsFromStorage())
  const searchKeyword = ref('')
  const sessionName = ref(loadSessionNameFromStorage())

  watch(
    selectedIds,
    (ids) => {
      try {
        localStorage.setItem(SELECTED_STORAGE_KEY, JSON.stringify(Array.from(ids)))
      } catch (e) {
        console.warn('Failed to save selected items to localStorage', e)
      }
    },
    { deep: true },
  )

  watch(
    sessionName,
    (name) => {
      try {
        localStorage.setItem(SESSION_NAME_STORAGE_KEY, name)
      } catch (e) {
        console.warn('Failed to save session name to localStorage', e)
      }
    },
  )

  watch(
    snapshots,
    (value) => {
      try {
        localStorage.setItem(SNAPSHOT_STORAGE_KEY, JSON.stringify(value))
      } catch (e) {
        console.warn('Failed to save snapshots to localStorage', e)
      }
    },
    { deep: true },
  )

  /** 已选器物数量 */
  const selectedCount = computed(() => selectedIds.value.size)

  /** 已选器物列表（保持 mock 原始顺序） */
  const selectedItems = computed(() =>
    items.value.filter((item) => selectedIds.value.has(item.id)),
  )

  /** 全部器物按 category 分组 */
  const groupedItems = computed(() => groupItemsByCategory(items.value))

  /** 全部 category 列表（去重） */
  const categories = computed(() =>
    Array.from(new Set(items.value.map((item) => item.category))),
  )

  /**
   * 按关键词过滤器物列表，匹配范围包含名称和描述。
   * @param keyword - 搜索关键词，为空时返回全部器物
   */
  function filterItemsByKeyword(keyword: string): TeawareItem[] {
    const trimmed = keyword.trim().toLowerCase()
    if (!trimmed) {
      return items.value
    }
    return items.value.filter(
      (item) =>
        item.name.toLowerCase().includes(trimmed) ||
        item.desc.toLowerCase().includes(trimmed),
    )
  }

  /**
   * 按关键词过滤并按分类分组的器物列表。
   */
  const groupedItemsByKeyword = computed(() =>
    groupItemsByCategory(filterItemsByKeyword(searchKeyword.value)),
  )

  /**
   * 设置搜索关键词。
   * @param keyword - 搜索关键词
   */
  function setSearchKeyword(keyword: string): void {
    searchKeyword.value = keyword
  }

  /**
   * 切换单个器物的勾选状态。
   * @param id - 器物 id
   */
  function toggleItem(id: string): void {
    const next = new Set(selectedIds.value)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    selectedIds.value = next
  }

  /**
   * 批量勾选指定分类下的所有器物。
   * @param category - 分类名称
   */
  function selectAllByCategory(category: string): void {
    const next = new Set(selectedIds.value)
    for (const item of items.value) {
      if (item.category === category) {
        next.add(item.id)
      }
    }
    selectedIds.value = next
  }

  /**
   * 批量取消指定分类下的所有器物勾选。
   * @param category - 分类名称
   */
  function clearByCategory(category: string): void {
    const next = new Set(selectedIds.value)
    for (const item of items.value) {
      if (item.category === category) {
        next.delete(item.id)
      }
    }
    selectedIds.value = next
  }

  /**
   * 批量勾选指定 ID 列表的器物。
   * @param ids - 器物 id 列表
   */
  function selectItems(ids: string[]): void {
    const next = new Set(selectedIds.value)
    for (const id of ids) {
      next.add(id)
    }
    selectedIds.value = next
  }

  /**
   * 批量取消指定 ID 列表的器物勾选。
   * @param ids - 器物 id 列表
   */
  function deselectItems(ids: string[]): void {
    const next = new Set(selectedIds.value)
    for (const id of ids) {
      next.delete(id)
    }
    selectedIds.value = next
  }

  /**
   * 判断器物是否已勾选。
   * @param id - 器物 id
   */
  function isSelected(id: string): boolean {
    return selectedIds.value.has(id)
  }

  /** 清空已选清单 */
  function clearSelection(): void {
    selectedIds.value = new Set()
  }

  /**
   * 套用预设方案，将方案中的器物设为勾选状态。
   * @param presetId - 预设方案 id
   */
  function applyPreset(presetId: string): void {
    const preset = presets.value.find((p) => p.id === presetId)
    if (!preset) return
    selectedIds.value = new Set(preset.teawareIds)
  }

  /** 快照数量 */
  const snapshotCount = computed(() => snapshots.value.length)

  /**
   * 保存当前已选器物为快照。
   * @returns 新创建的快照，若无已选器物则返回 null
   */
  function saveSnapshot(): ChecklistSnapshot | null {
    if (selectedIds.value.size === 0) {
      return null
    }
    const currentItems = selectedItems.value
    const snapshot: ChecklistSnapshot = {
      id: generateSnapshotId(),
      timestamp: Date.now(),
      teawareIds: Array.from(selectedIds.value),
      teawareNames: currentItems.map((item) => item.name),
    }
    snapshots.value.unshift(snapshot)
    return snapshot
  }

  /**
   * 恢复指定快照的勾选状态。
   * @param snapshotId - 快照 id
   */
  function restoreSnapshot(snapshotId: string): boolean {
    const snapshot = snapshots.value.find((s) => s.id === snapshotId)
    if (!snapshot) return false
    selectedIds.value = new Set(snapshot.teawareIds)
    return true
  }

  /**
   * 删除指定快照。
   * @param snapshotId - 快照 id
   */
  function deleteSnapshot(snapshotId: string): boolean {
    const index = snapshots.value.findIndex((s) => s.id === snapshotId)
    if (index === -1) return false
    snapshots.value.splice(index, 1)
    return true
  }

  /**
   * 设置茶席名称。
   * @param name - 茶席名称
   */
  function setSessionName(name: string): void {
    sessionName.value = name
  }

  function resetRestoredFlag(): void {
    restoredFromStorage.value = false
  }

  const EXPORT_PREFIX = 'TEA-CKLIST:'

  /**
   * 导出当前清单为可复制文本。
   * @returns 编码后的清单文本，包含茶席名称和已选器物编号
   */
  function exportChecklist(): string {
    const data = {
      v: 1,
      n: sessionName.value,
      ids: Array.from(selectedIds.value),
    }
    const json = JSON.stringify(data)
    const base64 = btoa(unescape(encodeURIComponent(json)))
    return EXPORT_PREFIX + base64
  }

  /**
   * 从文本导入清单，恢复茶席名称和已选器物。
   * @param text - 导出的清单文本
   * @returns 是否导入成功
   */
  function importChecklist(text: string): { success: boolean; message: string } {
    try {
      const trimmed = text.trim()
      if (!trimmed.startsWith(EXPORT_PREFIX)) {
        return { success: false, message: '无效的清单格式' }
      }
      const base64 = trimmed.slice(EXPORT_PREFIX.length)
      const json = decodeURIComponent(escape(atob(base64)))
      const data = JSON.parse(json) as { v: number; n: string; ids: string[] }

      if (data.v !== 1) {
        return { success: false, message: '不支持的清单版本' }
      }
      if (!Array.isArray(data.ids)) {
        return { success: false, message: '清单数据格式错误' }
      }

      const validIds = data.ids.filter((id) => items.value.some((item) => item.id === id))
      selectedIds.value = new Set(validIds)

      if (typeof data.n === 'string' && data.n.trim() !== '') {
        sessionName.value = data.n
      }

      return {
        success: true,
        message: `已恢复 ${validIds.length} 件器物${data.n ? `，茶席名称：${data.n}` : ''}`,
      }
    } catch (e) {
      console.warn('Failed to import checklist', e)
      return { success: false, message: '清单解析失败，请检查内容是否正确' }
    }
  }

  return {
    items,
    selectedIds,
    selectedCount,
    selectedItems,
    groupedItems,
    categories,
    presets,
    snapshots,
    snapshotCount,
    restoredFromStorage,
    searchKeyword,
    sessionName,
    groupedItemsByKeyword,
    toggleItem,
    isSelected,
    clearSelection,
    selectAllByCategory,
    clearByCategory,
    selectItems,
    deselectItems,
    applyPreset,
    saveSnapshot,
    restoreSnapshot,
    deleteSnapshot,
    resetRestoredFlag,
    filterItemsByKeyword,
    setSearchKeyword,
    setSessionName,
    exportChecklist,
    importChecklist,
  }
})
