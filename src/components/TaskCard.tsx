import { useState } from 'react'
import { format, isPast, isToday, addDays } from 'date-fns'
import type { Task, TeamMember } from '../types'
import { supabase } from '../lib/supabase'

interface TaskCardProps {
  task: Task
  members: TeamMember[]
  onUpdate: (updated: Task) => void
  onDelete: (id: string) => void
}

const PRIORITY_COLORS = {
  low: 'var(--priority-low)',
  normal: 'var(--priority-normal)',
  high: 'var(--priority-high)',
}

const PRIORITY_LABELS = {
  low: 'Low',
  normal: 'Normal',
  high: 'High',
}

function getDueDateInfo(due_date: string | null) {
  if (!due_date) return null
  const date = new Date(due_date)
  const today = new Date()
  if (isPast(date) && !isToday(date)) {
    return { label: `Overdue · ${format(date, 'MMM d')}`, color: 'var(--due-overdue)' }
  }
  if (isToday(date)) {
    return { label: `Due today`, color: 'var(--due-soon)' }
  }
  if (date <= addDays(today, 2)) {
    return { label: `Due ${format(date, 'MMM d')}`, color: 'var(--due-soon)' }
  }
  return { label: format(date, 'MMM d'), color: 'var(--due-ok)' }
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export default function TaskCard({ task, members, onUpdate, onDelete }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(task.title)
  const [editDesc, setEditDesc] = useState(task.description || '')
  const [editPriority, setEditPriority] = useState(task.priority)
  const [editDueDate, setEditDueDate] = useState(task.due_date || '')
  const [editAssignees, setEditAssignees] = useState<string[]>(task.assignee_ids || [])
  const [saving, setSaving] = useState(false)

  const dueDateInfo = getDueDateInfo(task.due_date)
  const assignedMembers = members.filter(m => (task.assignee_ids || []).includes(m.id))

  function toggleAssignee(memberId: string) {
    setEditAssignees(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    )
  }

  async function handleSave() {
    if (!editTitle.trim()) return
    setSaving(true)
    const updates = {
      title: editTitle.trim(),
      description: editDesc.trim() || null,
      priority: editPriority,
      due_date: editDueDate || null,
      assignee_ids: editAssignees,
    }
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', task.id)
      .select()
      .single()
    if (!error && data) {
      onUpdate(data)
      setIsEditing(false)
    }
    setSaving(false)
  }

  async function handleDelete() {
    await supabase.from('tasks').delete().eq('id', task.id)
    onDelete(task.id)
  }

  if (isEditing) {
    return (
      <div className="task-card task-card--editing">
        <input
          className="task-edit-input"
          value={editTitle}
          onChange={e => setEditTitle(e.target.value)}
          placeholder="Task title"
          autoFocus
        />
        <textarea
          className="task-edit-textarea"
          value={editDesc}
          onChange={e => setEditDesc(e.target.value)}
          placeholder="Description (optional)"
          rows={2}
        />
        <div className="task-edit-row">
          <select
            className="task-edit-select"
            value={editPriority}
            onChange={e => setEditPriority(e.target.value as Task['priority'])}
          >
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
          </select>
          <input
            className="task-edit-select"
            type="date"
            value={editDueDate}
            onChange={e => setEditDueDate(e.target.value)}
          />
        </div>
        {members.length > 0 && (
          <div className="assignee-picker">
            <p className="assignee-picker-label">Assign to</p>
            <div className="assignee-picker-members">
              {members.map(member => {
                const selected = editAssignees.includes(member.id)
                return (
                  <button
                    key={member.id}
                    className={`assignee-pick-btn${selected ? ' assignee-pick-btn--selected' : ''}`}
                    style={{
                      background: selected ? member.color : 'var(--bg-hover)',
                      borderColor: member.color,
                    }}
                    onClick={() => toggleAssignee(member.id)}
                    title={member.name}
                  >
                    {getInitials(member.name)}
                  </button>
                )
              })}
            </div>
          </div>
        )}
        <div className="task-edit-actions">
          <button className="btn-save" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button className="btn-cancel" onClick={() => setIsEditing(false)}>
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="task-card">
      <div className="task-card-header">
        <span
          className="task-priority-badge"
          style={{ color: PRIORITY_COLORS[task.priority], borderColor: PRIORITY_COLORS[task.priority] }}
        >
          {PRIORITY_LABELS[task.priority]}
        </span>
        <div className="task-card-actions">
          <button className="task-action-btn" onClick={() => setIsEditing(true)} title="Edit">✏️</button>
          <button className="task-action-btn" onClick={handleDelete} title="Delete">🗑️</button>
        </div>
      </div>
      <p className="task-title">{task.title}</p>
      {task.description && (
        <p className="task-description">{task.description}</p>
      )}
      {dueDateInfo && (
        <div className="task-due-date" style={{ color: dueDateInfo.color }}>
          📅 {dueDateInfo.label}
        </div>
      )}
      {assignedMembers.length > 0 && (
        <div className="task-assignees">
          {assignedMembers.map(member => (
            <div
              key={member.id}
              className="task-avatar"
              style={{ background: member.color }}
              title={member.name}
            >
              {getInitials(member.name)}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}