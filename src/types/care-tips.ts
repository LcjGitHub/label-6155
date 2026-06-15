/** 单条保养贴士 */
export interface CareTipItem {
  id: string
  title: string
  content: string
}

/** 按器物分类组织的保养贴士 */
export interface CareTipCategory {
  category: string
  tips: CareTipItem[]
}
