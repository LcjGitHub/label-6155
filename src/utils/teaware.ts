import type { TeawareItem, TeawareGroup } from '@/types/teaware'

export function groupItemsByCategory(items: TeawareItem[]): TeawareGroup[] {
  const map = new Map<string, TeawareItem[]>()
  for (const item of items) {
    const group = map.get(item.category) ?? []
    group.push(item)
    map.set(item.category, group)
  }
  return Array.from(map.entries()).map(([category, groupItems]) => ({
    category,
    items: groupItems,
  }))
}
