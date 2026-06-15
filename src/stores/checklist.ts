import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import teawareData from '@/mock/teaware.json'
import presetData from '@/mock/presets.json'
import type { TeawareGroup, TeawareItem, TeaPreset } from '@/types/teaware'

/**
 * 一席茶清单状态：勾选器物、统计数量、按分类浏览。
 */
export const useChecklistStore = defineStore('checklist', () => {
  const items = ref<TeawareItem[]>(teawareData as TeawareItem[])
  const selectedIds = ref<Set<string>>(new Set())
  const presets = ref<TeaPreset[]>(presetData as TeaPreset[])

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

  return {
    items,
    selectedIds,
    selectedCount,
    selectedItems,
    groupedItems,
    categories,
    presets,
    toggleItem,
    isSelected,
    clearSelection,
    applyPreset,
  }
})
