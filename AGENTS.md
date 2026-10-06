# Project Context for Antigravity

This file gives persistent context so an AI coding agent (e.g. Antigravity)
makes consistent choices across sessions. Read `ARCHITECTURE.md` and
`TASKS.md` first.

## What this is
A single-user desktop app (Electron + React + TypeScript + SQLite) that
tracks university assignments/quizzes/labs and fires local OS notifications
before deadlines. No backend, no login, fully offline.

## Conventions
- Language: TypeScript everywhere (no plain `.js` files)
- Renderer (React) never touches the database directly — always through
  `window.api.*` (exposed via `contextBridge` in `preload.ts`), which calls
  `ipcMain.handle` in the main process
- DB access only lives in `src/main/db.ts`
- Keep components small and in `src/renderer/components/`
- Use the `tasks` table schema exactly as defined in `ARCHITECTURE.md` §4 —
  if it needs to change, update that file in the same commit
- Dates stored as ISO 8601 strings in SQLite, converted to `Date` objects
  only in the renderer for display

## Do
- Follow the phase order in `TASKS.md`; check items off as you complete them
- Keep each phase runnable (`npm run dev` should not be broken) before moving on
- Write small, focused commits per task-list item

## Don't
- Don't add a backend/cloud sync — that's explicitly out of scope for v1
  (see "Optional Later" in `ARCHITECTURE.md`)
- Don't introduce a new state-management library (Redux, etc.) — plain React
  state/hooks is enough for this app's size
- Don't use `localStorage`/`sessionStorage` for task data — SQLite is the
  single source of truth
- Don't skip the IPC bridge and use Node APIs directly in the renderer
  (breaks `contextIsolation`/security)

## When stuck or ambiguous
Prefer the simplest option that satisfies `ARCHITECTURE.md`. If a decision
isn't covered there, note the assumption in a comment and proceed rather
than stalling.
