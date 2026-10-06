/**
 * src/main/db.ts
 * SQLite database layer — the ONLY place that touches the DB directly.
 * Renderer must always go through IPC (window.api.*), per AGENTS.md.
 *
 * DB file location follows README.md "Data location" section:
 *   Linux:   ~/.config/university-tracker/data.db
 *   macOS:   ~/Library/Application Support/university-tracker/data.db
 *   Windows: %APPDATA%/university-tracker/data.db
 *
 * We use app.getPath('userData') which resolves to the correct OS-specific path.
 */

import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'
import { mkdirSync } from 'fs'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TaskType = 'assignment' | 'quiz' | 'lab' | 'exam' | 'other'
export type Priority = 'low' | 'medium' | 'high'
export type Status = 'pending' | 'done'

/** Shape of a row returned from the tasks table. */
export interface Task {
  id: number
  title: string
  course: string | null
  type: TaskType
  due_date: string           // ISO 8601 string — converted to Date only in renderer
  priority: Priority
  notes: string | null
  status: Status
  reminder_offset_minutes: number
  reminder_sent: boolean
  created_at: string
}

/** Fields required when creating a new task (DB auto-fills the rest). */
export type NewTask = Pick<Task, 'title' | 'due_date'> &
  Partial<Pick<Task, 'course' | 'type' | 'priority' | 'notes' | 'reminder_offset_minutes'>>

/** Fields that can be changed on an existing task. */
export type UpdateTask = Partial<
  Pick<Task, 'title' | 'course' | 'type' | 'due_date' | 'priority' | 'notes' | 'status' | 'reminder_offset_minutes' | 'reminder_sent'>
>

// ---------------------------------------------------------------------------
// Database singleton
// ---------------------------------------------------------------------------

let db: Database.Database | null = null

/** Returns the open DB connection, throwing if initDb() was not called first. */
function getDb(): Database.Database {
  if (!db) throw new Error('Database not initialised — call initDb() first.')
  return db
}

// ---------------------------------------------------------------------------
// Initialisation
// ---------------------------------------------------------------------------

/**
 * Open (or create) the SQLite file and ensure the tasks table exists.
 * Must be called once from the main process before any queries.
 */
export function initDb(): void {
  // Assumption: app.getPath('userData') is available at call time (called
  // inside app.whenReady()). Using 'userData' matches README.md data-location.
  const userDataPath = app.getPath('userData')

  // Ensure the directory exists (electron usually creates it, but mkdirSync
  // is a no-op if it already exists with recursive:true)
  mkdirSync(userDataPath, { recursive: true })

  const dbPath = join(userDataPath, 'data.db')
  db = new Database(dbPath)

  // Enable WAL mode for better concurrent-read performance (safe for single user)
  db.pragma('journal_mode = WAL')

  // Create the tasks table exactly as defined in ARCHITECTURE.md §4
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id                      INTEGER PRIMARY KEY AUTOINCREMENT,
      title                   TEXT NOT NULL,
      course                  TEXT,
      type                    TEXT CHECK(type IN ('assignment','quiz','lab','exam','other')) DEFAULT 'assignment',
      due_date                TEXT NOT NULL,
      priority                TEXT CHECK(priority IN ('low','medium','high')) DEFAULT 'medium',
      notes                   TEXT,
      status                  TEXT CHECK(status IN ('pending','done')) DEFAULT 'pending',
      reminder_offset_minutes INTEGER DEFAULT 1440,
      reminder_sent           BOOLEAN DEFAULT 0,
      created_at              TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `)

  console.log(`[db] Opened database at: ${dbPath}`)
}

// ---------------------------------------------------------------------------
// CRUD functions
// ---------------------------------------------------------------------------

/**
 * Insert a new task and return the fully-populated row (including auto-
 * generated id and created_at).
 */
export function createTask(data: NewTask): Task {
  const stmt = getDb().prepare(`
    INSERT INTO tasks (title, course, type, due_date, priority, notes, reminder_offset_minutes)
    VALUES (@title, @course, @type, @due_date, @priority, @notes, @reminder_offset_minutes)
  `)

  const info = stmt.run({
    title: data.title,
    course: data.course ?? null,
    type: data.type ?? 'assignment',
    due_date: data.due_date,
    priority: data.priority ?? 'medium',
    notes: data.notes ?? null,
    reminder_offset_minutes: data.reminder_offset_minutes ?? 1440
  })

  // Read back the inserted row so the caller gets the full Task shape
  return getTaskById(Number(info.lastInsertRowid))
}

/**
 * Fetch every task, ordered by due_date ascending (soonest first).
 */
export function getAllTasks(): Task[] {
  return getDb()
    .prepare('SELECT * FROM tasks ORDER BY due_date ASC')
    .all() as Task[]
}

/**
 * Fetch a single task by id. Throws if not found.
 */
function getTaskById(id: number): Task {
  const row = getDb()
    .prepare('SELECT * FROM tasks WHERE id = ?')
    .get(id) as Task | undefined

  if (!row) throw new Error(`Task with id ${id} not found.`)
  return row
}

/**
 * Apply a partial update to an existing task.
 * Only the fields present in `data` are changed.
 */
export function updateTask(id: number, data: UpdateTask): Task {
  if (Object.keys(data).length === 0) return getTaskById(id)

  // Build SET clause dynamically from provided fields
  const setClauses = Object.keys(data)
    .map((key) => `${key} = @${key}`)
    .join(', ')

  getDb()
    .prepare(`UPDATE tasks SET ${setClauses} WHERE id = @id`)
    .run({ ...data, id })

  return getTaskById(id)
}

/**
 * Permanently remove a task by id.
 */
export function deleteTask(id: number): void {
  getDb().prepare('DELETE FROM tasks WHERE id = ?').run(id)
}

/**
 * Convenience wrapper: set status = 'done' for a task.
 */
export function markDone(id: number): Task {
  return updateTask(id, { status: 'done' })
}

/**
 * Fetch all pending tasks whose reminder is due but not yet sent:
 * (due_date - reminder_offset_minutes) <= now
 */
export function getDueReminders(nowLocalISO: string): Task[] {
  return getDb()
    .prepare(`
      SELECT * FROM tasks
      WHERE status = 'pending'
        AND reminder_sent = 0
        AND datetime(replace(due_date, 'T', ' '), '-' || reminder_offset_minutes || ' minutes') <= datetime(replace(@now, 'T', ' '))
      ORDER BY due_date ASC
    `)
    .all({ now: nowLocalISO }) as Task[]
}

/**
 * Mark a task's reminder as sent to avoid repeated alerts.
 */
export function markReminderSent(id: number): void {
  getDb()
    .prepare('UPDATE tasks SET reminder_sent = 1 WHERE id = ?')
    .run(id)
}

// ---------------------------------------------------------------------------
// Phase 2 smoke test — runs once at startup to prove DB works end-to-end.
// Remove or gate behind an env flag before shipping.
// ---------------------------------------------------------------------------

export function runDbSmokeTest(): void {
  console.log('\n--- DB Smoke Test ---')

  // Insert a sample task
  const created = createTask({
    title: 'CS101 Assignment 1',
    course: 'CS101',
    type: 'assignment',
    due_date: '2026-10-15T23:59:00',
    priority: 'high',
    notes: 'Smoke test task — safe to delete'
  })
  console.log('[db test] Inserted task:', created)

  // Read it back via getAllTasks
  const allTasks = getAllTasks()
  console.log(`[db test] getAllTasks() returned ${allTasks.length} row(s)`)

  // Mark as done
  const done = markDone(created.id)
  console.log('[db test] markDone() result:', done.status) // should print "done"

  // Clean up the smoke-test row so it doesn't litter the DB
  deleteTask(created.id)
  console.log('[db test] Deleted smoke-test task. Row count now:', getAllTasks().length)

  console.log('--- DB Smoke Test PASSED ---\n')
}
