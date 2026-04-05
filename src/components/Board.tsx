import React, { useState } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import type { DropResult } from '@hello-pangea/dnd'
import type { Task, Status } from '../types'
import { COLUMNS } from '../types'
import { supabase } from '../lib/supabase'
import TaskCard from './TaskCard'

interface BoardProps {
  tasks: Task[]
  setTasks: (tasks: Task[]) => void
  allTasks: Task[]
}

const COLUMN_COLORS: Record<Status, string> = {
  todo: 'var(--col-todo)',
  in_progress: 'var(--col-progress)',
  in_review: 'var(--col-review)',
  done: 'var(--col-done)',
}

export default function Board({ tasks, setTasks, allTasks }: BoardProps) {
  const [newTaskTitle, setNewTaskTitle] = useState<Record<Status, string>>({
    todo: '', in_progress: '', in_review: '', done: ''
  })
  const [addingTo, setAddingTo] = useState<Status | null>(null)
  const [newTaskPriority, setNewTaskPriority] = useState<Record<Status, string>>({
    todo: 'normal', in_progress: 'normal', in_review: 'normal', done: 'normal'
  })
  const [newTaskDueDate, setNewTaskDueDate] = useState<Record<Status, string>>({
    todo: '', in_progress: '', in_review: '', done: ''
  })

  function getTasksForColumn(status: Status) {
    return tasks.filter(t => t.status === status)
  }

  function getAllTasksForColumn(status: Status) {
    return allTasks.filter(t => t.status === status)
  }

  async function handleDragEnd(result: DropResult) {
    const { destination, source, draggableId } = result
    if (!destination) return
    if (destination.droppableId === source.droppableId) return

    const newStatus = destination.droppableId as Status

    const { data, error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', draggableId)
      .select()
      .single()

    if (!error && data) {
      setTasks(allTasks.map(t => t.id === draggableId ? data : t))
    }
  }

  async function handleAddTask(status: Status) {
    const title = newTaskTitle[status].trim()
    if (!title) return

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title,
        status,
        priority: newTaskPriority[status],
        due_date: newTaskDueDate[status] || null,
      })
      .select()
      .single()

    if (!error && data) {
      setTasks([...allTasks, data])
      setNewTaskTitle(prev => ({ ...prev, [status]: '' }))
      setNewTaskDueDate(prev => ({ ...prev, [status]: '' }))
      setNewTaskPriority(prev => ({ ...prev, [status]: 'normal' }))
      setAddingTo(null)
    }
  }

  function handleUpdateTask(updated: Task) {
    setTasks(allTasks.map(t => t.id === updated.id ? updated : t))
  }

  function handleDeleteTask(id: string) {
    setTasks(allTasks.filter(t => t.id !== id))
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="board">
        {COLUMNS.map(column => {
          const columnTasks = getTasksForColumn(column.id)
          const totalInColumn = getAllTasksForColumn(column.id).length
          const color = COLUMN_COLORS[column.id]
          const isAdding = addingTo === column.id

          return (
            <div className="column" key={column.id}>
              <div className="column-header">
                <div className="column-title-row">
                  <span className="column-dot" style={{ background: color }} />
                  <span className="column-title">{column.title}</span>
                  <span className="column-count">{totalInColumn}</span>
                </div>
                <button
                  className="column-add-btn"
                  onClick={() => setAddingTo(isAdding ? null : column.id)}
                  title="Add task"
                >
                  {isAdding ? '✕' : '+'}
                </button>
              </div>

              <div className="column-accent-bar" style={{ background: color }} />

              {isAdding && (
                <div className="new-task-form">
                  <input
                    className="task-edit-input"
                    placeholder="Task title..."
                    value={newTaskTitle[column.id]}
                    onChange={e => setNewTaskTitle(prev => ({ ...prev, [column.id]: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && handleAddTask(column.id)}
                    autoFocus
                  />
                  <div className="task-edit-row">
                    <select
                      className="task-edit-select"
                      value={newTaskPriority[column.id]}
                      onChange={e => setNewTaskPriority(prev => ({ ...prev, [column.id]: e.target.value }))}
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                    </select>
                    <input
                      className="task-edit-select"
                      type="date"
                      value={newTaskDueDate[column.id]}
                      onChange={e => setNewTaskDueDate(prev => ({ ...prev, [column.id]: e.target.value }))}
                    />
                  </div>
                  <div className="task-edit-actions">
                    <button className="btn-save" onClick={() => handleAddTask(column.id)}>
                      Add Task
                    </button>
                    <button className="btn-cancel" onClick={() => setAddingTo(null)}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    className={`column-tasks${snapshot.isDraggingOver ? ' column-tasks--over' : ''}`}
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {columnTasks.length === 0 && !snapshot.isDraggingOver && (
                      <div className="column-empty">
                        No tasks yet
                      </div>
                    )}
                    {columnTasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={snapshot.isDragging ? 'task-dragging' : ''}
                          >
                            <TaskCard
                              task={task}
                              onUpdate={handleUpdateTask}
                              onDelete={handleDeleteTask}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          )
        })}
      </div>
    </DragDropContext>
  )
}