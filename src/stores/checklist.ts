import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import teawareData from '@/mock/teaware.json'
import presetData from '@/mock/presets.json'
import type { TeawareGroup, TeawareItem, TeaPreset, ChecklistSnapshot } from '@/types/teaware'

const SELECTED_STORAGE_KEY = 'tea-checklist-selected'
const SNAPSHOT_STORAGE_KEY = 'tea-checklist-snapshots'

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
  const groupedItems = computed<TeawareGroup[]>(() => {
    const map = new Map<string, TeawareItem[]>()
    for (const item of items.value) {
      const group = map.get(item.category) ?? []
      group.push(item)
      map.set(item.category, group)
    }
    return Array.from(map.entries()).map(([category, groupItems]) => ({
      category,
      items: groupItems,
    }))
  })

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
  const groupedItemsByKeyword = computed<TeawareGroup[]>(() => {
    const filteredItems = filterItemsByKeyword(searchKeyword.value)
    const map = new Map<string, TeawareItem[]>()
    for (const item of filteredItems) {
      const group = map.get(item.category) ?? []
      group.push(item)
      map.set(item.category, group)
    }
    return Array.from(map.entries()).map(([category, groupItems]) => ({
      category,
      items: groupItems,
    }))
  })

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

  function resetRestoredFlag(): void {
    restoredFromStorage.value = false
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
    groupedItemsByKeyword,
    toggleItem,
    isSelected,
    clearSelection,
    applyPreset,
    saveSnapshot,
    restoreSnapshot,
    deleteSnapshot,
    resetRestoredFlag,
    filterItemsByKeyword,
    setSearchKeyword,
  }
})
