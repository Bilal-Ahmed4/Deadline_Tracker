# University Task & Deadline Tracker

Desktop app to track assignments, quizzes, and lab deadlines with local
reminders. See `ARCHITECTURE.md` for the full design.

## Prerequisites

- Node.js 18+ and npm
- Git

## Setup

```bash
git clone <your-repo-url>
cd university-tracker
npm install
```

## Development

```bash
npm run dev        # starts Electron + Vite with hot reload
```

## Build installers

```bash
npm run build       # bundles the app
npm run package     # produces .exe / .dmg / .AppImage via electron-builder
```

Installers land in `dist/`.

## Project layout

See the "Project Folder Structure" section in `ARCHITECTURE.md`.

## Data location

SQLite DB lives in the OS user-data folder (not in the repo), e.g.:
- Windows: `%APPDATA%/university-tracker/data.db`
- macOS: `~/Library/Application Support/university-tracker/data.db`
- Linux: `~/.config/university-tracker/data.db`

## Status

🚧 In development — see `TASKS.md` for current progress.
