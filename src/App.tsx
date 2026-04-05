import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import Board from './components/Board'
import Header from './components/Header'
import type { Task } from './types'

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')

  useEffect(() => {
    initSession()
  }, [])

  async function initSession() {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    console.log('session:', session)
    if (!session) {
      const { error } = await supabase.auth.signInAnonymously()
      console.log('sign in error:', error)
      if (error) throw error
    }
    await fetchTasks()
  } catch (err: any) {
    setError(err.message)
    setLoading(false)
  }
}

  async function fetchTasks() {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: true })
      if (error) throw error
      setTasks(data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase())
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter
    return matchesSearch && matchesPriority
  })

  if (loading) return (
    <div className="loading-screen">
      <div className="loading-spinner" />
      <p>Loading your board...</p>
    </div>
  )

  if (error) return (
    <div className="error-screen">
      <p>Something went wrong: {error}</p>
      <button onClick={() => window.location.reload()}>Retry</button>
    </div>
  )

  return (
    <div className="app">
      <Header
        tasks={tasks}
        search={search}
        setSearch={setSearch}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
      />
      <Board
        tasks={filteredTasks}
        setTasks={setTasks}
        allTasks={tasks}
      />
    </div>
  )
}