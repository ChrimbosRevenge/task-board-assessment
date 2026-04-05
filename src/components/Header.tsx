import type { Task } from '../types'

interface HeaderProps {
  tasks: Task[]
  search: string
  setSearch: (v: string) => void
  priorityFilter: string
  setPriorityFilter: (v: string) => void
}

export default function Header({ tasks, search, setSearch, priorityFilter, setPriorityFilter }: HeaderProps) {
  const total = tasks.length
  const done = tasks.filter(t => t.status === 'done').length
  const overdue = tasks.filter(t => {
    if (!t.due_date) return false
    return new Date(t.due_date) < new Date() && t.status !== 'done'
  }).length

  return (
    <header className="header">
      <div className="header-left">
        <div className="header-logo">
          <span className="header-logo-icon">⬡</span>
          <span className="header-logo-text">Its a Task Era</span>
        </div>
        <div className="header-stats">
          <div className="stat">
            <span className="stat-value">{total}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-divider" />
          <div className="stat">
            <span className="stat-value" style={{ color: 'var(--col-done)' }}>{done}</span>
            <span className="stat-label">Done</span>
          </div>
          <div className="stat-divider" />
          <div className="stat">
            <span className="stat-value" style={{ color: overdue > 0 ? 'var(--due-overdue)' : 'var(--text-secondary)' }}>{overdue}</span>
            <span className="stat-label">Overdue</span>
          </div>
        </div>
      </div>

      <div className="header-right">
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input
            className="search-input"
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="filter-select"
          value={priorityFilter}
          onChange={e => setPriorityFilter(e.target.value)}
        >
          <option value="all">All Priorities</option>
          <option value="high">High</option>
          <option value="normal">Normal</option>
          <option value="low">Low</option>
        </select>
      </div>
    </header>
  )
}