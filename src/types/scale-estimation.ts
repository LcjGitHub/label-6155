export interface TeawareItem {
  name: string
  category: string
  quantity: number
  remark?: string
}

export interface ScaleTier {
  id: string
  label: string
  peopleCount: string
  description: string
  items: TeawareItem[]
}
