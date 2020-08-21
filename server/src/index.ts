import * as t from './lib/_commonInterface'
const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const port = process.env.PORT || 3000
const path = require('path')
const Serial = require('./lib/serial.js').Serial
const Ssh = require('./lib/ssh.js').Ssh
const Telnet = require('./lib/telnet.js').Telnet
const store = {}

io.on('connection', function (socket) {
  socket.on('join', function (msg) {
    const config = msg.config
    if (msg.id in store) {
      socket.join(msg.id)
      io.to(msg.id).emit('join', 'connect')
      console.log('reconnect' + msg.id)
      return
    } else { io.to(msg.id).emit('join', 'expired') }
    store[msg.id] = config
    socket.join(msg.id)
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
          io.to(msg.id).emit('join', 'connect')
        },
        ondata: buf => {
          io.to(msg.id).emit('relay', buf)
        }
      })
    })()
  })
  socket.on('relay', function (msg) {
    if (!store[msg.id].host)io.to(msg.id).emit('join', 'expired')
    store[msg.id].host.write(msg.buf)
  })
})

const staticpublic = path.join(__dirname, '..', '..', 'client', 'public')
app.get('/', function (req, res) {
  res.sendFile(path.join(staticpublic, 'index.html'))
})
app.use(express.static(staticpublic))

http.listen(port, function () {
  console.log('listening on *:' + port)
})
