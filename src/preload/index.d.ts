import type { TaskApi } from './preload'
import type { Task, NewTask, UpdateTask, TaskType, Priority, Status } from '../main/db'

declare global {
  interface Window {
    api: TaskApi
  }
}

export type { Task, NewTask, UpdateTask, TaskType, Priority, Status, TaskApi }
