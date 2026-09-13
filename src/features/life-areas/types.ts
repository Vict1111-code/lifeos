export const lifeAreaCategories = ['career','education','skills','spiritual','health','financial','personal','relationships','projects','creativity','service'] as const
export type LifeAreaCategory = typeof lifeAreaCategories[number]

export interface LifeArea {
  id: string
  name: string
  category: LifeAreaCategory
  description: string | null
  color_token: string | null
  icon_name: string | null
  sort_order: number
  is_active: boolean
  goal_count: number
  task_count: number
  created_at: string
  updated_at: string
}

export interface LifeAreaInput {
  name: string
  category: LifeAreaCategory
  description: string
  color_token: string
  icon_name: string
  sort_order: number
}
