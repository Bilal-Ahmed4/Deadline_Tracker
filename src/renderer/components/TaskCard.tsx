/**
 * src/renderer/components/TaskCard.tsx
 * Shared task row/card component reused between TaskList and Dashboard.
 */

import React from 'react'
import type { Task } from './types'

interface TaskCardProps {
  task: Task
  onToggleStatus: (task: Task) => Promise<void>
  onDeleteTask: (id: number) => Promise<void>
}

export function formatDueDate(isoString: string): {
  formatted: string
  isOverdue: boolean
  relativeText: string
} {
  const date = new Date(isoString)
  const now = new Date()

  // Human-readable date string
  const formatted = date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  const diffMs = date.getTime() - now.getTime()
  const diffHours = Math.round(diffMs / (1000 * 60 * 60))
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

  const isOverdue = diffMs < 0

  let relativeText = ''
  if (isOverdue) {
    const overdueDays = Math.abs(diffDays)
    const overdueHours = Math.abs(diffHours)
    if (overdueHours < 24) {
      relativeText = `Overdue by ${overdueHours} hour${overdueHours === 1 ? '' : 's'}`
    } else {
      relativeText = `Overdue by ${overdueDays} day${overdueDays === 1 ? '' : 's'}`
    }
  } else if (diffHours < 24 && date.getDate() === now.getDate()) {
    relativeText = `Due today in ${diffHours} hour${diffHours === 1 ? '' : 's'}`
  } else if (diffDays === 1 || (diffHours < 48 && date.getDate() === now.getDate() + 1)) {
    relativeText = 'Due tomorrow'
  } else {
    relativeText = `Due in ${diffDays} days`
  }

  return { formatted, isOverdue, relativeText }
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleStatus,
  onDeleteTask
}) => {
  const { formatted, isOverdue, relativeText } = formatDueDate(task.due_date)
  const isDone = task.status === 'done'

  return (
    <div
      className={`task-item ${isDone ? 'done' : ''} ${!isDone && isOverdue ? 'overdue' : ''}`}
    >
      <input
        type="checkbox"
        className="task-checkbox"
        checked={isDone}
        onChange={() => onToggleStatus(task)}
        title={isDone ? 'Mark as pending' : 'Mark as done'}
      />

      <div className="task-content">
        <div className="task-header">
          <span className={`task-title ${isDone ? 'completed' : ''}`}>
            {task.title}
          </span>

          {task.course && <span className="badge badge-course">{task.course}</span>}

          <span className="badge badge-type">{task.type}</span>

          <span className={`badge badge-priority-${task.priority}`}>
            {task.priority} priority
          </span>
        </div>

        <div className="task-details">
          <span className={`due-date ${!isDone && isOverdue ? 'is-overdue' : ''}`}>
            📅 {formatted}
          </span>

          {!isDone && (
            <span
              style={{
                fontWeight: isOverdue ? 600 : 500,
                color: isOverdue ? 'var(--danger)' : 'var(--text-muted)'
              }}
            >
              ({relativeText})
            </span>
          )}
        </div>

        {task.notes && <div className="task-notes">{task.notes}</div>}
      </div>

      <div className="task-actions">
        <button
          type="button"
          className="btn btn-danger"
          onClick={() => {
            if (window.confirm(`Delete "${task.title}"?`)) {
              onDeleteTask(task.id)
            }
          }}
          title="Delete task"
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  )
}
