/** 茶器条目 */
export interface TeawareItem {
  id: string
  name: string
  category: string
  desc: string
  image: string
}

/** 按分类分组后的茶器 */
export interface TeawareGroup {
  category: string
  items: TeawareItem[]
}

/** 茶席方案预设 */
export interface TeaPreset {
  id: string
  name: string
  desc: string
  coverImage: string
  teawareIds: string[]
}

/** 清单快照 */
export interface ChecklistSnapshot {
  id: string
  timestamp: number
  teawareIds: string[]
  teawareNames: string[]
}
