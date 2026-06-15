/** 茶叶品种 */
export interface TeaItem {
  id: string
  name: string
  category: string
  origin: string
  desc: string
  image: string
}

/** 按分类分组后的茶叶 */
export interface TeaGroup {
  category: string
  items: TeaItem[]
}
