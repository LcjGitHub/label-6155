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
