/**
 * src/main/ipcHandlers.ts
 * Registers ipcMain.handle() endpoints that map to db.ts functions and system settings.
 * All DB access stays in the main process — renderer communicates exclusively
 * via these IPC channels, satisfying AGENTS.md security & architectural rules.
 */

import { ipcMain, app } from 'electron'
import {
  createTask,
  getAllTasks,
  updateTask,
  deleteTask,
  markDone,
  getSetting,
  setSetting,
  type NewTask,
  type UpdateTask,
  type Task
} from './db'

export function registerIpcHandlers(): void {
  // Tasks CRUD
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

  // Settings
  ipcMain.handle('settings:getStartup', (): boolean => {
    const pref = getSetting('launchOnStartup', '')
    if (pref !== '') {
      return pref === 'true'
    }
    return app.getLoginItemSettings().openAtLogin
  })

  ipcMain.handle('settings:setStartup', (_event, enabled: boolean): boolean => {
    app.setLoginItemSettings({ openAtLogin: enabled })
    setSetting('launchOnStartup', enabled ? 'true' : 'false')
    return enabled
  })
}
