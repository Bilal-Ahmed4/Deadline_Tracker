/**
 * src/main/scheduler.ts
 * Background reminder scheduler loop.
 * Runs every 60 seconds (and once immediately on startup).
 * Queries SQLite for due reminders, fires native OS notifications,
 * and sets reminder_sent = 1.
 */

import { Notification } from 'electron'
import { getDueReminders, markReminderSent, type Task } from './db'

/**
 * Returns current local date-time string in ISO format YYYY-MM-DDTHH:mm:ss
 * matching the format stored in tasks.due_date.
 */
function getLocalNowString(): string {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
}

/**
 * Format relative deadline text for notification body.
 */
function formatRelativeDue(dueIso: string): string {
  const due = new Date(dueIso).getTime()
  const now = Date.now()
  const diffMs = due - now
  const diffMinutes = Math.round(diffMs / (1000 * 60))
  const diffHours = Math.round(diffMs / (1000 * 60 * 60))
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

  if (diffMs <= 0) {
    const overdueMinutes = Math.abs(diffMinutes)
    if (overdueMinutes < 60) {
      return `overdue by ${overdueMinutes} min`
    }
    return `overdue by ${Math.abs(diffHours)} hours`
  }
  if (diffMinutes < 60) {
    return `due in ${diffMinutes} minute${diffMinutes === 1 ? '' : 's'}`
  }
  if (diffHours < 24) {
    return `due in ${diffHours} hour${diffHours === 1 ? '' : 's'}`
  }
  return `due in ${diffDays} day${diffDays === 1 ? '' : 's'}`
}

/**
 * Checks for tasks whose reminder time has passed, shows OS notification,
 * and marks reminder_sent = 1 in the database.
 */
export function checkAndSendReminders(): void {
  try {
    const nowLocalISO = getLocalNowString()
    const dueTasks: Task[] = getDueReminders(nowLocalISO)

    if (dueTasks.length === 0) {
      return
    }

    console.log(`[scheduler] Found ${dueTasks.length} task reminder(s) due at ${nowLocalISO}`)

    for (const task of dueTasks) {
      const title = `⏰ ${task.course ? `[${task.course}] ` : ''}${task.title}`
      const relativeTime = formatRelativeDue(task.due_date)
      const body = `Due ${task.due_date.replace('T', ' ')} (${relativeTime})`

      if (Notification.isSupported()) {
        const notification = new Notification({
          title,
          body,
          silent: false
        })

        notification.show()
        console.log(`[scheduler] Fired notification for task #${task.id}: "${task.title}"`)
      } else {
        console.warn(`[scheduler] OS Notifications not supported. Alert for #${task.id}: "${title} - ${body}"`)
      }

      // Immediately mark as sent in database to prevent repeated notifications
      markReminderSent(task.id)
    }
  } catch (err) {
    console.error('[scheduler] Error checking reminders:', err)
  }
}

/**
 * Starts the reminder scheduler.
 * Runs check immediately once on startup (catches missed reminders),
 * then repeats every 60 seconds.
 */
export function startReminderScheduler(): NodeJS.Timeout {
  console.log('[scheduler] Starting reminder scheduler (check interval: 60s)')

  // 1. Initial check on app startup (catches reminders due while app was closed)
  checkAndSendReminders()

  // 2. Periodic check every 60 seconds
  const intervalId = setInterval(checkAndSendReminders, 60000)

  return intervalId
}
