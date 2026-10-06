/**
 * src/renderer/components/TaskList.tsx
 * Lists tasks sorted by due date, utilizing the shared TaskCard component.
 * Features friendly empty states for both zero tasks and zero filter matches.
 */

import React from 'react'
import type { Task } from './types'
import { TaskCard } from './TaskCard'

interface TaskListProps {
  tasks: Task[]
  totalCount?: number
  onResetFilters?: () => void
  onToggleStatus: (task: Task) => Promise<void>
  onDeleteTask: (id: number) => Promise<void>
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  totalCount = 0,
  onResetFilters,
  onToggleStatus,
  onDeleteTask
}) => {
  if (tasks.length === 0) {
    if (totalCount === 0) {
      return (
        <div className="card empty-state">
          <div className="empty-state-icon">🎉</div>
          <h3>All Caught Up!</h3>
          <p>
            You have no tasks tracked right now. Click <strong>+ New Task</strong> above to add
            your first deadline.
          </p>
        </div>
      )
    }

    return (
      <div className="card empty-state">
        <div className="empty-state-icon">🔍</div>
        <h3>No Matching Tasks</h3>
        <p>No deadlines match your current search keywords or filters.</p>
        {onResetFilters && (
          <button type="button" className="btn btn-secondary" onClick={onResetFilters}>
            Clear Filters
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="task-list">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onToggleStatus={onToggleStatus}
          onDeleteTask={onDeleteTask}
        />
      ))}
    </div>
  )
}
