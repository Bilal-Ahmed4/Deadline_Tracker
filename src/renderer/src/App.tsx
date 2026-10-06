/**
 * src/renderer/src/App.tsx
 * Main application dashboard rendering Dashboard (Overdue & Upcoming),
 * TaskForm, FilterBar, and TaskList.
 * Includes Phase 7 Polish: Dark mode toggle & Launch-on-startup setting.
 */

import React, { useState, useEffect, useMemo } from 'react'
import { useTasks } from '../hooks/useTasks'
import { Dashboard } from '../components/Dashboard'
import { TaskForm } from '../components/TaskForm'
import { FilterBar } from '../components/FilterBar'
import { TaskList } from '../components/TaskList'
import type { TaskFilters, NewTask, Task } from '../components/types'

function App(): React.ReactElement {
  const { tasks, loading, error, addTask, removeTask, toggleTaskStatus } = useTasks()

  // --- Phase 7 Polish: Dark Mode ---
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('theme') === 'dark'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light')
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light')
  }, [isDarkMode])

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev)
  }

  // --- Phase 7 Polish: Launch on Startup Setting ---
  const [launchOnStartup, setLaunchOnStartup] = useState<boolean>(false)

  useEffect(() => {
    if (window.api && typeof window.api.getStartupSetting === 'function') {
      window.api.getStartupSetting().then(setLaunchOnStartup).catch(console.error)
    }
  }, [])

  const handleToggleStartup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked
    setLaunchOnStartup(checked)
    if (window.api && typeof window.api.setStartupSetting === 'function') {
      try {
        await window.api.setStartupSetting(checked)
      } catch (err) {
        console.error('Failed to set startup preference:', err)
      }
    }
  }

  // --- Filters ---
  const [filters, setFilters] = useState<TaskFilters>({
    course: 'all',
    type: 'all',
    status: 'all',
    searchQuery: ''
  })

  const resetFilters = () => {
    setFilters({
      course: 'all',
      type: 'all',
      status: 'all',
      searchQuery: ''
    })
  }

  // Extract unique courses from existing tasks for the course filter dropdown
  const availableCourses = useMemo(() => {
    const courseSet = new Set<string>()
    tasks.forEach((t) => {
      if (t.course) courseSet.add(t.course)
    })
    return Array.from(courseSet).sort()
  }, [tasks])

  // Filter tasks based on current criteria for the full task list
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
        <div className="app-header-title">
          <h1>📚 University Task &amp; Deadline Tracker</h1>
        </div>

        <div className="header-controls">
          <div className="task-stats">
            <span>{pendingCount}</span> pending &bull; <span>{completedCount}</span> completed
          </div>

          <div className="settings-bar">
            {/* Startup setting toggle */}
            <label className="toggle-label" title="Automatically launch on OS startup">
              <input
                type="checkbox"
                checked={launchOnStartup}
                onChange={handleToggleStartup}
              />
              Launch on startup
            </label>

            {/* Dark mode button */}
            <button
              type="button"
              className="btn btn-icon"
              onClick={toggleDarkMode}
              title={isDarkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            >
              {isDarkMode ? '☀️ Light' : '🌙 Dark'}
            </button>
          </div>
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

      {/* 
        Dashboard placed first at top so students immediately see urgent deadlines
        (Overdue & Upcoming Next 7 Days) upon opening the app.
      */}
      <Dashboard
        tasks={tasks}
        onToggleStatus={handleToggleStatus}
        onDeleteTask={handleDeleteTask}
      />

      {/* Task Creation Form */}
      <TaskForm onAddTask={handleAddTask} />

      {/* All Tasks Section with Filtering & Searching */}
      <div style={{ marginTop: '2rem', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>
          📑 All Tasks
        </h2>
        <FilterBar
          filters={filters}
          onFilterChange={setFilters}
          availableCourses={availableCourses}
        />
      </div>

      {/* Task List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
          Loading tasks from database...
        </div>
      ) : (
        <TaskList
          tasks={filteredTasks}
          totalCount={tasks.length}
          onResetFilters={resetFilters}
          onToggleStatus={handleToggleStatus}
          onDeleteTask={handleDeleteTask}
        />
      )}
    </div>
  )
}

export default App
