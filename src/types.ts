export type Priority = 'low' | 'normal' | 'high'
export type Status = 'todo' | 'in_progress' | 'in_review' | 'done'


export interface Task {
  id: string
  title: string
  description: string | null
  status: Status
  priority: Priority
  due_date: string | null
  user_id: string
  created_at: string
}

export interface Column {
  id: Status
  title: string
}

export const COLUMNS: Column[] = [
  { id: 'todo', title: 'To Do' },
  { id: 'in_progress', title: 'In Progress' },
  { id: 'in_review', title: 'In Review' },
  { id: 'done', title: 'Done' },
]