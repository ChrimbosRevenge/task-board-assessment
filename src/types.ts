export type Priority = 'low' | 'normal' | 'high'
export type Status = 'todo' | 'in_progress' | 'in_review' | 'done'

export interface Task {
  id: string
  title: string
  description: string | null
  status: Status
  priority: Priority
  due_date: string | null
  assignee_ids: string[]
  user_id: string
  created_at: string
}

export interface TeamMember {
  id: string
  name: string
  color: string
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

export const MEMBER_COLORS = [
  '#7c6dfa',
  '#f87171',
  '#34d399',
  '#fbbf24',
  '#60a5fa',
  '#f472b6',
  '#a78bfa',
  '#fb923c',
]