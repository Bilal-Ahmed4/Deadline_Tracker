/**
 * src/main/ipcHandlers.ts
 * Registers ipcMain.handle() endpoints that map to db.ts functions.
 * All DB access stays in the main process — renderer communicates exclusively
 * via these IPC channels, satisfying AGENTS.md security & architectural rules.
 */

import { ipcMain } from 'electron'
import {
  createTask,
  getAllTasks,
  updateTask,
  deleteTask,
  markDone,
  type NewTask,
  type UpdateTask,
  type Task
} from './db'

export function registerIpcHandlers(): void {
  ipcMain.handle('tasks:create', (_event, data: NewTask): Task => {
    return createTask(data)
  })

  ipcMain.handle('tasks:getAll', (): Task[] => {
    return getAllTasks()
  })

  ipcMain.handle('tasks:update', (_event, id: number, data: UpdateTask): Task => {
    return updateTask(id, data)
  })

  ipcMain.handle('tasks:delete', (_event, id: number): void => {
    return deleteTask(id)
  })

  ipcMain.handle('tasks:markDone', (_event, id: number): Task => {
    return markDone(id)
  })
}
