import * as fs from 'fs'
import * as t from './_commonInterface'
import * as path from 'path'

export class LoggerOption {
  // Loggerで使うものたち
  ClientBinaryFullpath?
  ClientBinaryEncording?
  ClientTextFullpath?
  ClientTextEncording?
  HostBinaryFullpath?
  HostBinaryEncording?
  HostTextFullpath?
  HostTextEncording?
  LogPath
  LogPrefix
  constructor (option?) {
    this.LogPath = path.join(__dirname, '../../log')
    try {
      fs.statSync(this.LogPath)
    } catch (error) {
      if (error.code === 'ENOENT') {
        fs.mkdirSync(this.LogPath)
      } else {
        throw error
      }
    }
    this.LogPrefix = Date.now().toString()
    this.ClientBinaryFullpath = path.join(this.LogPath, this.LogPrefix + 'client.bin')
    this.ClientBinaryEncording = 'utf-8'
    this.ClientTextFullpath = path.join(this.LogPath, this.LogPrefix + 'client.txt')
    this.ClientTextEncording = 'utf-8'
    this.HostBinaryFullpath = path.join(this.LogPath, this.LogPrefix + 'host.bin')
    this.HostBinaryEncording = 'utf-8'
    this.HostTextFullpath = path.join(this.LogPath, this.LogPrefix + 'host.txt')
    this.HostTextEncording = 'utf-8'
    // client,hostがnullかどうかをみてnullが入っていない場合
  }
}

export class Logger {
  client:t.Log
  host:t.Log
  loggerOption:any
  constructor (option?) {
    this.loggerOption = new LoggerOption()
    this.client = {
      bin: this.loggerOption.ClientBinaryFullpath === null
        ? null : fs.createWriteStream(
          this.loggerOption.ClientBinaryFullpath,
          this.loggerOption.ClientBinaryEncording
        ),
      txt:
        this.loggerOption.ClientTextFullpath === null
          ? null : fs.createWriteStream(
            this.loggerOption.ClientTextFullpath,
            this.loggerOption.ClientTextEncording
          )
    }

    this.host = {
      bin:
            this.loggerOption.HostBinaryFullpath === null
              ? null : fs.createWriteStream(
                this.loggerOption.HostBinaryFullpath,
                this.loggerOption.HostBinaryEncording
              ),
      txt: this.loggerOption.HostBinaryEncording === null
        ? null : fs.createWriteStream(
          this.loggerOption.HostTextFullpath,
          this.loggerOption.HostTextEncording
        )
    }
  }

  write (buf, option) {
    if (option === 'input' && this.client) {
      const str = typeof buf === 'string' ? buf : buf.toString()
      if (this.client.bin) this.client.bin.write(Array.from(buf).join(' ') + '\n')
      if (this.client.txt) this.client.txt.write(str)
    } else if (option === 'output' && this.host) {
      const str = typeof buf === 'string' ? buf : buf.toString()
      if (this.host.bin) this.host.bin.write(Array.from(buf).join(' ') + '\n')
      if (this.host.txt) this.host.txt.write(str)
    }
  }

  close () {
    if (this.client) {
      if (this.client.bin) this.client.bin.close()
      if (this.client.txt) this.client.txt.close()
    }
    if (this.host) {
      if (this.host.bin) this.host.bin.close()
      if (this.host.txt) this.host.txt.close()
    }
  }
}

export class LibCommon {
  constructor () {
    this.logger = Logger
  }

  logger
}
