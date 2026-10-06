/**
 * src/renderer/components/TaskList.tsx
 * Lists tasks sorted by due date, utilizing the shared TaskCard component.
 */

import React from 'react'
import type { Task } from './types'
import { TaskCard } from './TaskCard'

interface TaskListProps {
  tasks: Task[]
  onToggleStatus: (task: Task) => Promise<void>
  onDeleteTask: (id: number) => Promise<void>
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onToggleStatus,
  onDeleteTask
}) => {
  if (tasks.length === 0) {
    return (
      <div className="card empty-state">
        <div className="empty-state-icon">📋</div>
        <h3>No tasks found</h3>
        <p>You have no tasks matching the selected filters. Add a new task above to get started!</p>
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
