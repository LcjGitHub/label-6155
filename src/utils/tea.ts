import type { TeaItem, TeaGroup } from '@/types/tea'

export function groupTeaByCategory(items: TeaItem[]): TeaGroup[] {
  const map = new Map<string, TeaItem[]>()
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
