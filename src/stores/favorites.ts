import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import teawareData from '@/mock/teaware.json'
import type { TeawareItem } from '@/types/teaware'
import { groupItemsByCategory } from '@/utils/teaware'
import { useChecklistStore } from '@/stores/checklist'

const STORAGE_KEY = 'tea-favorites'

function loadFavoritesFromStorage(): Set<string> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return new Set(JSON.parse(stored))
    }
  } catch (e) {
    console.warn('Failed to load favorites from localStorage', e)
  }
  return new Set()
}

export const useFavoritesStore = defineStore('favorites', () => {
  const items = ref<TeawareItem[]>(teawareData as TeawareItem[])
  const favoriteIds = ref<Set<string>>(loadFavoritesFromStorage())

  watch(
    favoriteIds,
    (ids) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(ids)))
      } catch (e) {
        console.warn('Failed to save favorites to localStorage', e)
      }
    },
    { deep: true },
  )

  const favoriteCount = computed(() => favoriteIds.value.size)

  const favoriteItems = computed(() =>
    items.value.filter((item) => favoriteIds.value.has(item.id)),
  )

  const groupedFavorites = computed(() => groupItemsByCategory(favoriteItems.value))

  function toggleFavorite(id: string): void {
    const next = new Set(favoriteIds.value)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    favoriteIds.value = next
  }

  function isFavorite(id: string): boolean {
    return favoriteIds.value.has(id)
  }

  function clearFavorites(): void {
    favoriteIds.value = new Set()
  }

  function addAllToChecklist(): number {
    const checklistStore = useChecklistStore()
    const currentSelected = checklistStore.selectedIds
    const newIds = Array.from(favoriteIds.value).filter((id) => !currentSelected.has(id))
    const addedCount = newIds.length
    if (addedCount > 0) {
      checklistStore.selectItems(newIds)
    }
    return addedCount
  }

  return {
    favoriteIds,
    favoriteCount,
    favoriteItems,
    groupedFavorites,
    toggleFavorite,
    isFavorite,
    clearFavorites,
    addAllToChecklist,
  }
})
