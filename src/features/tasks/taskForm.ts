export type TaskFormValues = {
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'inbox' | 'planned' | 'in_progress'
  due_at: string
  start_at: string
  estimated_minutes: string
  goal_id: string
  life_area_id: string
}

export const emptyTaskForm: TaskFormValues = {
  title: '',
  description: '',
  priority: 'medium',
  status: 'planned',
  due_at: '',
  start_at: '',
  estimated_minutes: '',
  goal_id: '',
  life_area_id: '',
}
