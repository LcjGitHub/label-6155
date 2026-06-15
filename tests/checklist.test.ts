import { describe, it, expect } from 'vitest'
import { useChecklistStore } from '@/stores/checklist'
import { groupItemsByCategory } from '@/utils/teaware'
import teawareData from '@/mock/teaware.json'
import type { TeawareItem } from '@/types/teaware'

const mockItems = teawareData as TeawareItem[]
const groupedItems = groupItemsByCategory(mockItems)

describe('checklist store - 单个器物勾选切换 (toggleItem)', () => {
  it('初始状态下勾选数量为 0，勾选集合为空', () => {
    const store = useChecklistStore()
    expect(store.selectedCount).toBe(0)
    expect(store.selectedIds.size).toBe(0)
  })

  it('勾选单个器物后，勾选数量为 1，编号集合包含该编号', () => {
    const store = useChecklistStore()
    store.toggleItem('tw-001')
    expect(store.selectedCount).toBe(1)
    expect(store.selectedIds.has('tw-001')).toBe(true)
    expect(Array.from(store.selectedIds)).toEqual(['tw-001'])
  })

  it('取消勾选单个器物后，勾选数量恢复为 0，编号集合为空', () => {
    const store = useChecklistStore()
    store.toggleItem('tw-001')
    expect(store.selectedCount).toBe(1)
    store.toggleItem('tw-001')
    expect(store.selectedCount).toBe(0)
    expect(store.selectedIds.size).toBe(0)
  })

  it('连续勾选多个不同器物，数量与集合同步累加', () => {
    const store = useChecklistStore()
    store.toggleItem('tw-001')
    store.toggleItem('tw-002')
    store.toggleItem('tw-003')
    expect(store.selectedCount).toBe(3)
    const ids = Array.from(store.selectedIds).sort()
    expect(ids).toEqual(['tw-001', 'tw-002', 'tw-003'].sort())
  })

  it('重复勾选同一器物不会增加数量', () => {
    const store = useChecklistStore()
    store.toggleItem('tw-001')
    store.toggleItem('tw-001')
    store.toggleItem('tw-001')
    expect(store.selectedCount).toBe(1)
    expect(store.selectedIds.has('tw-001')).toBe(true)
  })
})

describe('checklist store - 按分类批量勾选 (selectAllByCategory)', () => {
  it('批量勾选"茶壶"分类，数量为该分类器物总数，集合包含全部对应编号', () => {
    const store = useChecklistStore()
    const category = '茶壶'
    const categoryItems = groupedItems.find((g) => g.category === category)!.items
    const expectedIds = categoryItems.map((item) => item.id)

    store.selectAllByCategory(category)

    expect(store.selectedCount).toBe(expectedIds.length)
    const actualIds = Array.from(store.selectedIds).sort()
    expect(actualIds).toEqual(expectedIds.sort())
  })

  it('批量勾选"茶杯"分类，数量与编号集合均符合预期', () => {
    const store = useChecklistStore()
    const category = '茶杯'
    const categoryItems = groupedItems.find((g) => g.category === category)!.items
    const expectedIds = categoryItems.map((item) => item.id)

    store.selectAllByCategory(category)

    expect(store.selectedCount).toBe(expectedIds.length)
    const actualIds = Array.from(store.selectedIds).sort()
    expect(actualIds).toEqual(expectedIds.sort())
  })

  it('已勾选部分器物后再批量勾选分类，结果为两者并集', () => {
    const store = useChecklistStore()
    store.toggleItem('tw-001')
    expect(store.selectedCount).toBe(1)

    const category = '盖碗'
    const categoryItems = groupedItems.find((g) => g.category === category)!.items
    const expectedIds = ['tw-001', ...categoryItems.map((item) => item.id)]

    store.selectAllByCategory(category)

    expect(store.selectedCount).toBe(expectedIds.length)
    const actualIds = Array.from(store.selectedIds).sort()
    expect(actualIds).toEqual(expectedIds.sort())
  })

  it('对空分类执行批量勾选不影响结果', () => {
    const store = useChecklistStore()
    store.selectAllByCategory('不存在的分类')
    expect(store.selectedCount).toBe(0)
    expect(store.selectedIds.size).toBe(0)
  })
})

describe('checklist store - 按分类批量取消 (clearByCategory)', () => {
  it('批量取消"茶壶"分类后，该分类器物全部不在已选集合中', () => {
    const store = useChecklistStore()
    const category = '茶壶'

    store.selectAllByCategory(category)
    expect(store.selectedCount).toBeGreaterThan(0)

    store.clearByCategory(category)

    expect(store.selectedCount).toBe(0)
    const categoryItems = groupedItems.find((g) => g.category === category)!.items
    for (const item of categoryItems) {
      expect(store.selectedIds.has(item.id)).toBe(false)
    }
  })

  it('批量取消单一分类不影响其他分类的勾选状态', () => {
    const store = useChecklistStore()
    const teapotCategory = '茶壶'
    const cupCategory = '茶杯'

    store.selectAllByCategory(teapotCategory)
    store.selectAllByCategory(cupCategory)

    const teapotItems = groupedItems.find((g) => g.category === teapotCategory)!.items
    const cupItems = groupedItems.find((g) => g.category === cupCategory)!.items
    const totalCount = teapotItems.length + cupItems.length
    expect(store.selectedCount).toBe(totalCount)

    store.clearByCategory(teapotCategory)

    expect(store.selectedCount).toBe(cupItems.length)
    for (const item of teapotItems) {
      expect(store.selectedIds.has(item.id)).toBe(false)
    }
    for (const item of cupItems) {
      expect(store.selectedIds.has(item.id)).toBe(true)
    }
  })

  it('对未勾选的分类执行批量取消无副作用', () => {
    const store = useChecklistStore()
    store.toggleItem('tw-001')
    store.clearByCategory('盖碗')
    expect(store.selectedCount).toBe(1)
    expect(store.selectedIds.has('tw-001')).toBe(true)
  })
})

describe('checklist store - 清空全部勾选 (clearSelection)', () => {
  it('清空全部后勾选数量为 0，编号集合为空', () => {
    const store = useChecklistStore()
    store.toggleItem('tw-001')
    store.toggleItem('tw-002')
    store.toggleItem('tw-003')
    expect(store.selectedCount).toBe(3)

    store.clearSelection()

    expect(store.selectedCount).toBe(0)
    expect(store.selectedIds.size).toBe(0)
  })

  it('批量勾选所有分类后清空，结果为空集合', () => {
    const store = useChecklistStore()
    for (const group of groupedItems) {
      store.selectAllByCategory(group.category)
    }
    expect(store.selectedCount).toBe(mockItems.length)

    store.clearSelection()

    expect(store.selectedCount).toBe(0)
    expect(store.selectedIds.size).toBe(0)
  })

  it('对空集合执行清空操作无副作用', () => {
    const store = useChecklistStore()
    expect(store.selectedCount).toBe(0)
    store.clearSelection()
    expect(store.selectedCount).toBe(0)
    expect(store.selectedIds.size).toBe(0)
  })
})
