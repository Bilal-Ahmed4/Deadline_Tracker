/**
 * src/renderer/hooks/useTasks.ts
 * Custom hook managing tasks state via the IPC bridge (window.api).
 * SQLite remains the single source of truth per AGENTS.md.
 */

import { useState, useEffect, useCallback } from 'react'
import type { Task, NewTask, UpdateTask } from '../components/types'

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const refreshTasks = useCallback(async () => {
    try {
      setLoading(true)
      const data = await window.api.getAllTasks()
      setTasks(data)
      setError(null)
    } catch (err) {
      console.error('[useTasks] Failed to fetch tasks:', err)
      setError('Failed to load tasks from database')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshTasks()
  }, [refreshTasks])

  const addTask = async (taskData: NewTask): Promise<Task> => {
    try {
      const created = await window.api.createTask(taskData)
      setTasks((prev) => [...prev, created].sort((a, b) => a.due_date.localeCompare(b.due_date)))
      return created
    } catch (err) {
      console.error('[useTasks] Failed to create task:', err)
      throw err
    }
  }

  const editTask = async (id: number, data: UpdateTask): Promise<Task> => {
    try {
      const updated = await window.api.updateTask(id, data)
      setTasks((prev) =>
        prev
          .map((t) => (t.id === id ? updated : t))
          .sort((a, b) => a.due_date.localeCompare(b.due_date))
      )
      return updated
    } catch (err) {
      console.error('[useTasks] Failed to update task:', err)
      throw err
    }
  }

  const removeTask = async (id: number): Promise<void> => {
    try {
      await window.api.deleteTask(id)
      setTasks((prev) => prev.filter((t) => t.id !== id))
    } catch (err) {
      console.error('[useTasks] Failed to delete task:', err)
      throw err
    }
  }

  const toggleTaskStatus = async (task: Task): Promise<Task> => {
    const newStatus = task.status === 'done' ? 'pending' : 'done'
    return editTask(task.id, { status: newStatus })
  }

  return {
    tasks,
    loading,
    error,
    refreshTasks,
    addTask,
    editTask,
    removeTask,
    toggleTaskStatus
  }
}
