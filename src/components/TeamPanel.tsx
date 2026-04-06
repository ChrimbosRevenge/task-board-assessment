import React, { useState } from 'react'
import type { TeamMember } from '../types'
import { MEMBER_COLORS } from '../types'
import { supabase } from '../lib/supabase'

interface TeamPanelProps {
  members: TeamMember[]
  setMembers: (members: TeamMember[]) => void
  onClose: () => void
}

export default function TeamPanel({ members, setMembers, onClose }: TeamPanelProps) {
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(MEMBER_COLORS[0])
  const [adding, setAdding] = useState(false)

  async function handleAdd() {
    const name = newName.trim()
    if (!name) return
    setAdding(true)

    const { data: { user } } = await supabase.auth.getUser()

    const { data, error } = await supabase
      .from('team_members')
      .insert({ name, color: newColor, user_id: user?.id })
      .select()
      .single()

    if (!error && data) {
      setMembers([...members, data])
      setNewName('')
      setNewColor(MEMBER_COLORS[0])
    }
    setAdding(false)
  }

  async function handleDelete(id: string) {
    await supabase.from('team_members').delete().eq('id', id)
    setMembers(members.filter(m => m.id !== id))
  }

  function getInitials(name: string) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <div className="team-panel-overlay" onClick={onClose}>
      <div className="team-panel" onClick={e => e.stopPropagation()}>
        <div className="team-panel-header">
          <h2 className="team-panel-title">Team Members</h2>
          <button className="team-panel-close" onClick={onClose}>✕</button>
        </div>

        <div className="team-panel-members">
          {members.length === 0 && (
            <p className="team-panel-empty">No team members yet. Add one below.</p>
          )}
          {members.map(member => (
            <div className="team-member-row" key={member.id}>
              <div
                className="member-avatar"
                style={{ background: member.color }}
              >
                {getInitials(member.name)}
              </div>
              <span className="member-name">{member.name}</span>
              <button
                className="member-delete-btn"
                onClick={() => handleDelete(member.id)}
                title="Remove member"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>

        <div className="team-panel-add">
          <p className="team-panel-add-title">Add a member</p>
          <input
            className="task-edit-input"
            placeholder="Full name"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
          />
          <div className="color-picker">
            {MEMBER_COLORS.map(color => (
              <button
                key={color}
                className={`color-swatch${newColor === color ? ' color-swatch--active' : ''}`}
                style={{ background: color }}
                onClick={() => setNewColor(color)}
              />
            ))}
          </div>
          <button
            className="btn-save"
            onClick={handleAdd}
            disabled={adding || !newName.trim()}
          >
            {adding ? 'Adding...' : 'Add Member'}
          </button>
        </div>
      </div>
    </div>
  )
}