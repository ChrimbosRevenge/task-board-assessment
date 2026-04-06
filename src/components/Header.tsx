import React, { useState } from 'react'
import type { Task, TeamMember } from '../types'
import TeamPanel from './TeamPanel'

interface HeaderProps {
  tasks: Task[]
  members: TeamMember[]
  setMembers: (members: TeamMember[]) => void
  search: string
  setSearch: (v: string) => void
  priorityFilter: string
  setPriorityFilter: (v: string) => void
}

export default function Header({ tasks, members, setMembers, search, setSearch, priorityFilter, setPriorityFilter }: HeaderProps) {
  const [showTeam, setShowTeam] = useState(false)

  const total = tasks.length
  const done = tasks.filter(t => t.status === 'done').length
  const overdue = tasks.filter(t => {
    if (!t.due_date) return false
    return new Date(t.due_date) < new Date() && t.status !== 'done'
  }).length

  function getInitials(name: string) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <>
      <header className="header">
        <div className="header-left">
          <div className="header-logo">
            <span className="header-logo-icon">⬡</span>
            <span className="header-logo-text">TaskFlow</span>
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

          <div className="header-team">
            {members.slice(0, 4).map(member => (
              <div
                key={member.id}
                className="header-avatar"
                style={{ background: member.color }}
                title={member.name}
              >
                {getInitials(member.name)}
              </div>
            ))}
            {members.length > 4 && (
              <div className="header-avatar header-avatar--overflow">
                +{members.length - 4}
              </div>
            )}
            <button className="team-btn" onClick={() => setShowTeam(true)}>
              👥 Team
            </button>
          </div>
        </div>
      </header>

      {showTeam && (
        <TeamPanel
          members={members}
          setMembers={setMembers}
          onClose={() => setShowTeam(false)}
        />
      )}
    </>
  )
}