import * as t from 'teratermen'
import URI from 'urijs';

const { BrowserWindow, app } = require('electron')
const serve = require('electron-serve')
const path = require('path')
const loadURL = serve({ directory: path.join(__dirname, '../../client/public/') })
const minimist = require('minimist');
const args = minimist(process.argv.slice(1));
let mainWindow

const CreateWindow = async () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      preload: path.join(__dirname, '../../client/public', 'preload.js')
    }
  })
  await loadURL(mainWindow)
  mainWindow.loadFile(path.join(__dirname, '../../client/public', 'index.html'))

  mainWindow.webContents.openDevTools()
  mainWindow.on('closed', function () {
    mainWindow = null
  })
}
app.whenReady().then(() => {
  CreateWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) CreateWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})
console.log(process.version)

const Serial = require('./lib/serial.js').Serial
const Ssh = require('./lib/ssh.js').Ssh
const Telnet = require('./lib/telnet.js').Telnet
const store = {}
const { ipcMain } = require('electron')
ipcMain.on('connect', (event, msg) => {
  const hostConfig = URI.parse(args._[0])
  event.sender.send('connect', JSON.stringify({
    protocol:hostConfig.protocol,
    username:hostConfig.username,
    password:hostConfig.password,
    hostname:hostConfig.hostname,
    port:hostConfig.port
  }))
})
ipcMain.handle('connect', async (event, someArgument) => {
  return Date.now()
})
ipcMain.on('join', (event, msg:t.JOINMSG) => {
  const config = msg.config
  if (msg.id in store) {
    event.sender.send('join', 'reconnect')
    console.log('reconnect' + msg.id)
    return
  } else { event.sender.send('join', 'connect') }
  store[msg.id] = config
  store[msg.id].host = (() => {
    const host =
      config.protocol === 'serial' ? new Serial()
        : config.protocol === 'ssh' ? new Ssh()
          : config.protocol === 'telnet' ? new Telnet() : null
    return host.connect({
      host: config.hostname,
      username: config.username,
      password: config.password,
      port: config.port,
      onconnect: () => {
        event.sender.send('join', 'connect')
      },
      ondata: buf => {
        event.sender.send('relay', buf)
      },
      session: msg.id
    })
  })()
})
ipcMain.on('relay', (event, msg) => {
  if (!store[msg.id].host)event.sender.send('join', 'connect')
  store[msg.id].host.write(Buffer.from(msg.buf))
})
