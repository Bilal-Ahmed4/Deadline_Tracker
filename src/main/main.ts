import { app, BrowserWindow, shell, Tray, Menu, nativeImage } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import { initDb, getSetting } from './db'
import { registerIpcHandlers } from './ipcHandlers'
import { startReminderScheduler } from './scheduler'

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null
let isQuitting = false

function createTray(win: BrowserWindow): void {
  // Resolve icon path for dev and prod packaging
  const iconPath = join(__dirname, '../../assets/icon.png')
  const icon = nativeImage.createFromPath(iconPath)

  tray = new Tray(icon)
  tray.setToolTip('University Task & Deadline Tracker')

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open Tracker',
      click: () => {
        win.show()
        win.focus()
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        isQuitting = true
        app.quit()
      }
    }
  ])

  tray.setContextMenu(contextMenu)

  // Clicking tray icon toggles window visibility
  tray.on('click', () => {
    if (win.isVisible()) {
      win.hide()
    } else {
      win.show()
      win.focus()
    }
  })
}

function createWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1100,
    height: 750,
    title: 'University Task & Deadline Tracker',
    icon: join(__dirname, '../../assets/icon.png'),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  win.on('ready-to-show', () => {
    win.show()
  })

  // Phase 7: Minimize to tray instead of quitting when user closes the window
  win.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault()
      win.hide()
    }
  })

  win.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // Load the renderer: Vite dev server in dev, built file in prod
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return win
}

app.whenReady().then(() => {
  // 1. Initialise the database (creates file + tables if they don't exist)
  initDb()

  // 2. Register IPC endpoints for renderer <-> main DB and settings communication
  registerIpcHandlers()

  // 3. Apply launch on startup preference saved in SQLite
  const startupPref = getSetting('launchOnStartup', '')
  if (startupPref !== '') {
    app.setLoginItemSettings({ openAtLogin: startupPref === 'true' })
  }

  // 4. Start background reminder scheduler (60s loop + immediate startup catch-up)
  startReminderScheduler()

  // 5. Create window and system tray
  mainWindow = createWindow()
  createTray(mainWindow)

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createWindow()
    } else if (mainWindow) {
      mainWindow.show()
      mainWindow.focus()
    }
  })
})

// Set isQuitting flag before quit so close handler doesn't prevent application exit
app.on('before-quit', () => {
  isQuitting = true
})

app.on('window-all-closed', () => {
  // On platforms where app stays in tray, keep running unless explicit quit
  if (isQuitting && process.platform !== 'darwin') {
    app.quit()
  }
})
