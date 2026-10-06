/**
 * src/renderer/components/Dashboard.tsx
 * Highlights critical deadlines across two focal sections:
 *   1. "Overdue" — pending tasks whose due date has passed
 *   2. "Upcoming (next 7 days)" — pending tasks due within the next 7 days
 * Reuses the shared TaskCard component to ensure consistent layout, badges,
 * and priority color-coding across the application.
 */

import React, { useMemo } from 'react'
import type { Task } from './types'
import { TaskCard } from './TaskCard'

interface DashboardProps {
  tasks: Task[]
  onToggleStatus: (task: Task) => Promise<void>
  onDeleteTask: (id: number) => Promise<void>
}

export const Dashboard: React.FC<DashboardProps> = ({
  tasks,
  onToggleStatus,
  onDeleteTask
}) => {
  const now = new Date()
  const nowTime = now.getTime()
  const sevenDaysFromNowTime = nowTime + 7 * 24 * 60 * 60 * 1000

  // 1. Overdue section: pending tasks where due_date < now
  // Assumption: Sorted descending by due_date (soonest-overdue / most recently expired at top)
  // so items that just slipped past their deadline are immediately prominent.
  const overdueTasks = useMemo(() => {
    return tasks
      .filter((t) => t.status === 'pending' && new Date(t.due_date).getTime() < nowTime)
      .sort((a, b) => b.due_date.localeCompare(a.due_date))
  }, [tasks, nowTime])

  // 2. Upcoming section: pending tasks where now <= due_date <= now + 7 days
  // Sorted ascending by due_date (soonest due first) so the next immediate deadline is at top.
  const upcomingTasks = useMemo(() => {
    return tasks
      .filter((t) => {
        if (t.status !== 'pending') return false
        const taskTime = new Date(t.due_date).getTime()
        return taskTime >= nowTime && taskTime <= sevenDaysFromNowTime
      })
      .sort((a, b) => a.due_date.localeCompare(b.due_date))
  }, [tasks, nowTime, sevenDaysFromNowTime])

  return (
    <div className="dashboard-container">
      {/* Overdue Section */}
      <section className="dashboard-section overdue-section card">
        <div className="dashboard-section-header">
          <h2 className="dashboard-section-title">
            <span role="img" aria-label="warning">⚠️</span> Overdue Tasks
          </h2>
          <span
            className={`badge ${overdueTasks.length > 0 ? 'badge-priority-high' : 'badge-type'}`}
          >
            {overdueTasks.length} {overdueTasks.length === 1 ? 'task' : 'tasks'}
          </span>
        </div>

        {overdueTasks.length > 0 ? (
          <div className="task-list">
            {overdueTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggleStatus={onToggleStatus}
                onDeleteTask={onDeleteTask}
              />
            ))}
          </div>
        ) : (
          <div className="dashboard-empty-state">
            <span role="img" aria-label="celebration">🎉</span> Nothing overdue — you are all caught up!
          </div>
        )}
      </section>

      {/* Upcoming (Next 7 Days) Section */}
      <section className="dashboard-section upcoming-section card">
        <div className="dashboard-section-header">
          <h2 className="dashboard-section-title">
            <span role="img" aria-label="clock">⏰</span> Upcoming Deadlines (Next 7 Days)
          </h2>
          <span className="badge badge-course">
            {upcomingTasks.length} {upcomingTasks.length === 1 ? 'task' : 'tasks'}
          </span>
        </div>

        {upcomingTasks.length > 0 ? (
          <div className="task-list">
            {upcomingTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggleStatus={onToggleStatus}
                onDeleteTask={onDeleteTask}
              />
            ))}
          </div>
        ) : (
          <div className="dashboard-empty-state">
            <span role="img" aria-label="calendar">🏖️</span> No upcoming deadlines due in the next 7 days.
          </div>
        )}
      </section>
    </div>
  )
}
