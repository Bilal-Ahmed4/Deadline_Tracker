/**
 * src/renderer/components/TaskForm.tsx
 * Form component to add new university tasks.
 */

import React, { useState } from 'react'
import type { NewTask, TaskType, Priority } from './types'

interface TaskFormProps {
  onAddTask: (task: NewTask) => Promise<void>
}

export const TaskForm: React.FC<TaskFormProps> = ({ onAddTask }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [course, setCourse] = useState('')
  const [type, setType] = useState<TaskType>('assignment')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [reminderOffset, setReminderOffset] = useState<number>(1440) // 24 hours default
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      setValidationError('Please enter a task title')
      return
    }

    if (!dueDate) {
      setValidationError('Please select a deadline date and time')
      return
    }

    setValidationError(null)
    setSubmitting(true)

    try {
      // Ensure ISO 8601 format e.g. YYYY-MM-DDTHH:mm:00
      const formattedDueDate = dueDate.length === 16 ? `${dueDate}:00` : dueDate

      await onAddTask({
        title: title.trim(),
        course: course.trim() ? course.trim().toUpperCase() : null,
        type,
        due_date: formattedDueDate,
        priority,
        reminder_offset_minutes: reminderOffset,
        notes: notes.trim() ? notes.trim() : null
      })

      // Reset form
      setTitle('')
      setCourse('')
      setType('assignment')
      setDueDate('')
      setPriority('medium')
      setReminderOffset(1440)
      setNotes('')
      setIsOpen(false)
    } catch (err) {
      console.error('Failed to add task:', err)
      setValidationError('Failed to save task to database')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="card">
      <div className="card-title">
        <span>➕ Add New Task</span>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          {isOpen ? 'Cancel' : '+ New Task'}
        </button>
      </div>

      {isOpen && (
        <form onSubmit={handleSubmit} className="task-form">
          {validationError && (
            <div
              style={{
                gridColumn: '1 / -1',
                padding: '0.5rem 0.75rem',
                background: 'var(--danger-bg)',
                color: 'var(--danger)',
                borderRadius: '6px',
                fontSize: '0.875rem'
              }}
            >
              {validationError}
            </div>
          )}

          <div className="form-group full-width">
            <label htmlFor="title">Task Title *</label>
            <input
              id="title"
              type="text"
              className="form-control"
              placeholder="e.g. Operating Systems Lab 3 Submission"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="course">Course Code</label>
            <input
              id="course"
              type="text"
              className="form-control"
              placeholder="e.g. CS301, MATH200"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="type">Task Type</label>
            <select
              id="type"
              className="form-control"
              value={type}
              onChange={(e) => setType(e.target.value as TaskType)}
            >
              <option value="assignment">Assignment</option>
              <option value="quiz">Quiz</option>
              <option value="lab">Lab</option>
              <option value="exam">Exam</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="dueDate">Deadline (Date &amp; Time) *</label>
            <input
              id="dueDate"
              type="datetime-local"
              className="form-control"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="priority">Priority</label>
            <select
              id="priority"
              className="form-control"
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="reminderOffset">Reminder Alert</label>
            <select
              id="reminderOffset"
              className="form-control"
              value={reminderOffset}
              onChange={(e) => setReminderOffset(Number(e.target.value))}
            >
              <option value={60}>1 hour before</option>
              <option value={120}>2 hours before</option>
              <option value={720}>12 hours before</option>
              <option value={1440}>24 hours (1 day) before [Default]</option>
              <option value={2880}>2 days before</option>
              <option value={10080}>1 week before</option>
            </select>
          </div>

          <div className="form-group full-width">
            <label htmlFor="notes">Notes &amp; Instructions</label>
            <textarea
              id="notes"
              className="form-control"
              placeholder="Additional notes, submission links, rubric details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Add Task'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
