# Build Checklist

Work through these in order. Each phase should run/build successfully before
moving to the next — don't let unfinished pieces pile up.

## Phase 1 — Scaffold
- [x] Init project with `electron-vite` (React + TypeScript template)
- [x] Confirm `npm run dev` opens a blank Electron window
- [x] Set up folder structure from `ARCHITECTURE.md` (§5)

## Phase 2 — Database layer
- [x] Add `better-sqlite3`
- [x] Create `src/main/db.ts`: init DB file, create `tasks` table (schema in `ARCHITECTURE.md` §4)
- [x] Write functions: `createTask`, `getAllTasks`, `updateTask`, `deleteTask`, `markDone`
- [x] Quick manual test: insert + read a row, log to console

## Phase 3 — IPC bridge
- [x] Expose DB functions in `src/main/ipcHandlers.ts` via `ipcMain.handle`
- [x] Expose a safe API in `src/preload/preload.ts` via `contextBridge`
- [x] Confirm renderer can call `window.api.getAllTasks()` and get data back

## Phase 4 — Core UI
- [x] `TaskForm.tsx` — add new task (title, course, type, due date, priority, notes)
- [x] `TaskList.tsx` — list all tasks, sorted by due date
- [x] Mark done / delete actions on each task row
- [x] `FilterBar.tsx` — filter by course / type / status

## Phase 5 — Dashboard
- [x] `Dashboard.tsx` — upcoming (next 7 days) and overdue sections
- [x] Visual priority indicator (color-coded)

## Phase 6 — Reminders
- [x] `src/main/scheduler.ts` — 60s interval loop checking due reminders
- [x] Trigger `new Notification(...)` when a task's reminder time is hit
- [x] Set `reminder_sent = 1` after firing
- [x] Run the same check once on app startup (catch missed reminders)
- [x] Let user set reminder offset per task (default 24h before)

## Phase 7 — Polish
- [x] System tray icon + "minimize to tray"
- [x] "Launch on startup" setting
- [x] Dark mode toggle
- [x] Empty states (no tasks yet, all caught up 🎉)

## Phase 8 — Package & ship
- [ ] Configure `electron-builder.yml`
- [ ] Build installer for your OS, test a clean install
- [ ] Update `README.md` status to "v1 complete"

## Backlog (v2+)
- [ ] Recurring tasks
- [ ] Calendar view
- [ ] `.ics` export
- [ ] Cloud sync
