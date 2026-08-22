const { app, BrowserWindow, session, shell } = require('electron')
const fs = require('fs')
const path = require('path')

const DEFAULT_BOUNDS = { width: 1080, height: 820 }
const ALLOWED_EXTERNAL_PROTOCOLS = new Set(['http:', 'https:', 'xhsdiscover:', 'pinterest:'])

function statePath() {
  return path.join(app.getPath('userData'), 'window-state.json')
}

function readWindowState() {
  try {
    const value = JSON.parse(fs.readFileSync(statePath(), 'utf8'))
    return {
      width: Math.max(760, Number(value.width) || DEFAULT_BOUNDS.width),
      height: Math.max(640, Number(value.height) || DEFAULT_BOUNDS.height),
      x: Number.isFinite(value.x) ? value.x : undefined,
      y: Number.isFinite(value.y) ? value.y : undefined,
      maximized: Boolean(value.maximized),
    }
  } catch {
    return DEFAULT_BOUNDS
  }
}

function writeWindowState(win) {
  if (win.isDestroyed()) return
  const bounds = win.isMaximized() ? win.getNormalBounds() : win.getBounds()
  const value = { ...bounds, maximized: win.isMaximized() }
  try {
    fs.mkdirSync(path.dirname(statePath()), { recursive: true })
    fs.writeFileSync(statePath(), JSON.stringify(value), 'utf8')
  } catch {
    // A read-only user profile should not prevent the app from closing.
  }
}

function openExternal(url) {
  try {
    const parsed = new URL(url)
    if (ALLOWED_EXTERNAL_PROTOCOLS.has(parsed.protocol)) shell.openExternal(url)
  } catch {
    // Ignore malformed or unsupported URLs.
  }
}

function createWindow() {
  const state = readWindowState()
  const win = new BrowserWindow({
    ...state,
    minWidth: 760,
    minHeight: 640,
    show: false,
    title: '搭了么',
    backgroundColor: '#F7F5F2',
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      spellcheck: false,
    },
  })

  if (state.maximized) win.maximize()
  win.setMenuBarVisibility(false)
  win.once('ready-to-show', () => win.show())
  win.on('close', () => writeWindowState(win))

  win.webContents.setWindowOpenHandler(({ url }) => {
    openExternal(url)
    return { action: 'deny' }
  })

  win.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith('file://')) {
      event.preventDefault()
      openExternal(url)
    }
  })

  win.webContents.on('before-input-event', (event, input) => {
    if ((input.control || input.meta) && ['r', 'R'].includes(input.key)) event.preventDefault()
  })

  win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
}

if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  app.whenReady().then(() => {
    session.defaultSession.setPermissionRequestHandler((_webContents, _permission, callback) => {
      callback(false)
    })
    createWindow()
  })

  app.on('second-instance', () => {
    const [win] = BrowserWindow.getAllWindows()
    if (!win) return
    if (win.isMinimized()) win.restore()
    win.show()
    win.focus()
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
