/**
 * src/renderer/components/types.ts
 * Shared task and filter type definitions for renderer components.
 */

export type TaskType = 'assignment' | 'quiz' | 'lab' | 'exam' | 'other'
export type Priority = 'low' | 'medium' | 'high'
export type Status = 'pending' | 'done'

export interface Task {
  id: number
  title: string
  course: string | null
  type: TaskType
  due_date: string // ISO 8601 string, e.g. 2026-10-15T23:59:00
  priority: Priority
  notes: string | null
  status: Status
  reminder_offset_minutes: number
  reminder_sent: boolean | number
  created_at: string
}

export type NewTask = Pick<Task, 'title' | 'due_date'> &
  Partial<Pick<Task, 'course' | 'type' | 'priority' | 'notes' | 'reminder_offset_minutes'>>

export type UpdateTask = Partial<
  Pick<
    Task,
    | 'title'
    | 'course'
    | 'type'
    | 'due_date'
    | 'priority'
    | 'notes'
    | 'status'
    | 'reminder_offset_minutes'
    | 'reminder_sent'
  >
>

export interface TaskFilters {
  course: string
  type: string
  status: string
  searchQuery: string
}
