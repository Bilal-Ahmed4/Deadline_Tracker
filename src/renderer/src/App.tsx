/**
 * src/renderer/src/App.tsx
 * Main application dashboard rendering TaskForm, FilterBar, and TaskList.
 */

import React, { useState, useMemo } from 'react'
import { useTasks } from '../hooks/useTasks'
import { TaskForm } from '../components/TaskForm'
import { FilterBar } from '../components/FilterBar'
import { TaskList } from '../components/TaskList'
import type { TaskFilters, NewTask, Task } from '../components/types'

function App(): React.ReactElement {
  const { tasks, loading, error, addTask, removeTask, toggleTaskStatus } = useTasks()

  const [filters, setFilters] = useState<TaskFilters>({
    course: 'all',
    type: 'all',
    status: 'all',
    searchQuery: ''
  })

  // Extract unique courses from existing tasks for the course filter dropdown
  const availableCourses = useMemo(() => {
    const courseSet = new Set<string>()
    tasks.forEach((t) => {
      if (t.course) courseSet.add(t.course)
    })
    return Array.from(courseSet).sort()
  }, [tasks])

  // Filter tasks based on current criteria
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (filters.course !== 'all' && t.course !== filters.course) return false
      if (filters.type !== 'all' && t.type !== filters.type) return false
      if (filters.status !== 'all' && t.status !== filters.status) return false
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase()
        const matchTitle = t.title.toLowerCase().includes(q)
        const matchNotes = t.notes ? t.notes.toLowerCase().includes(q) : false
        if (!matchTitle && !matchNotes) return false
      }
      return true
    })
  }, [tasks, filters])

  const pendingCount = tasks.filter((t) => t.status === 'pending').length
  const completedCount = tasks.filter((t) => t.status === 'done').length

  const handleAddTask = async (newTaskData: NewTask) => {
    await addTask(newTaskData)
  }

  const handleToggleStatus = async (task: Task) => {
    await toggleTaskStatus(task)
  }

  const handleDeleteTask = async (id: number) => {
    await removeTask(id)
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div>
          <h1>📚 University Task &amp; Deadline Tracker</h1>
        </div>
        <div className="task-stats">
          <span>{pendingCount}</span> pending &bull; <span>{completedCount}</span> completed
        </div>
      </header>

      {error && (
        <div
          style={{
            padding: '0.75rem 1rem',
            background: 'var(--danger-bg)',
            color: 'var(--danger)',
            borderRadius: 'var(--radius)',
            marginBottom: '1rem',
            fontSize: '0.875rem'
          }}
        >
          {error}
        </div>
      )}

      {/* Task Creation Form */}
      <TaskForm onAddTask={handleAddTask} />

      {/* Filtering and Searching */}
      <FilterBar
        filters={filters}
        onFilterChange={setFilters}
        availableCourses={availableCourses}
      />

      {/* Task List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
          Loading tasks from database...
        </div>
      ) : (
        <TaskList
          tasks={filteredTasks}
          onToggleStatus={handleToggleStatus}
          onDeleteTask={handleDeleteTask}
        />
      )}
    </div>
  )
}

export default App
