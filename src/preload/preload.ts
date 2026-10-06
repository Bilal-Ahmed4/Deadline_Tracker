/**
 * src/preload/preload.ts
 * Secure IPC bridge exposed to the renderer via contextBridge.
 *
 * Enforces the security boundary (contextIsolation):
 * Renderer (React) calls window.api.* and NEVER touches Node APIs or the database directly.
 */

import { contextBridge, ipcRenderer } from 'electron'
import type { Task, NewTask, UpdateTask } from '../main/db'

export interface TaskApi {
  createTask: (data: NewTask) => Promise<Task>
  getAllTasks: () => Promise<Task[]>
  updateTask: (id: number, data: UpdateTask) => Promise<Task>
  deleteTask: (id: number) => Promise<void>
  markDone: (id: number) => Promise<Task>
  getStartupSetting: () => Promise<boolean>
  setStartupSetting: (enabled: boolean) => Promise<boolean>
}

const api: TaskApi = {
  createTask: (data: NewTask): Promise<Task> => ipcRenderer.invoke('tasks:create', data),
  getAllTasks: (): Promise<Task[]> => ipcRenderer.invoke('tasks:getAll'),
  updateTask: (id: number, data: UpdateTask): Promise<Task> => ipcRenderer.invoke('tasks:update', id, data),
  deleteTask: (id: number): Promise<void> => ipcRenderer.invoke('tasks:delete', id),
  markDone: (id: number): Promise<Task> => ipcRenderer.invoke('tasks:markDone', id),
  getStartupSetting: (): Promise<boolean> => ipcRenderer.invoke('settings:getStartup'),
  setStartupSetting: (enabled: boolean): Promise<boolean> => ipcRenderer.invoke('settings:setStartup', enabled)
}

// Expose the safe API object to the renderer process
contextBridge.exposeInMainWorld('api', api)
