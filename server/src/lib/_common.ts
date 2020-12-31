import * as fs from 'fs'
import * as t from 'teratermen'
import * as path from 'path'
import * as config from '../../server.conf.js'

export const DefaultOption = {
  log: {
    default: {
      dir: path.join(__dirname, '/../../log/'),
      ext: 'log.txt',
      name: Date.now().toString(),
      encording: 'utf-8'
    },
    client: {
      bin: {
        dir: path.join(__dirname, '/../../log/'),
        ext: 'bin.txt',
        name: Date.now().toString() + '_{session}_client'
      },
      txt: {
        dir: path.join(__dirname, '/../../log/'),
        ext: 'txt',
        name: Date.now().toString() + '_{session}_client'
      }
    },
    host: {
      bin: {
        dir: path.join(__dirname, '/../../log/'),
        ext: 'bin.txt',
        name: Date.now().toString() + '_{session}_host'
      },
      txt: {
        dir: path.join(__dirname, '/../../log/'),
        ext: 'txt',
        name: Date.now().toString() + '_{session}_host'
      }
    }
  }
}
export class LoggerOption {
  ClientBinaryFullpath
  ClientBinaryEncording
  ClientTextFullpath
  ClientTextEncording
  HostBinaryFullpath
  HostBinaryEncording
  HostTextFullpath
  HostTextEncording
  constructor (option) {
    if (!option)option = DefaultOption
    else {
      if (!option.log)option.log = DefaultOption.log
    }

    function pathResolver (mode:string) {
      let fullpath = ''
      const unit:t.unitOption =
      mode === 'ClientBinaryFullpath' ? option.log.client.bin
        : mode === 'ClientTextFullpath' ? option.log.client.txt
          : mode === 'HostBinaryFullpath' ? option.log.host.bin
            : mode === 'HostTextFullpath' ? option.log.host.txt
              : null
      function deffo (prpty:string) {
        let default1 = {}
        let default2 = {}
        let default3 = {}
        if (mode === 'ClientBinaryFullpath' || mode === 'ClientTextFullpath') {
          if (option?.log?.client?.default)default1 = option.log.client.default
          default3 =
          mode === 'ClientBinaryFullpath' ? DefaultOption.log.client.bin
            : mode === 'ClientTextFullpath' ? DefaultOption.log.client.txt
              : DefaultOption.log.default
        }
        if (mode === 'HostBinaryFullpath' || mode === 'HostTextFullpath') {
          if (option?.log?.host?.default)default1 = option.log.host.default
          default3 =
          mode === 'HostBinaryFullpath' ? DefaultOption.log.host.bin
            : mode === 'HostTextFullpath' ? DefaultOption.log.host.txt
              : DefaultOption.log.default
        }
        if (option?.log?.default)default2 = option.log.default
        return default1[prpty] || default2[prpty] || default3[prpty]
      }

      if (unit.path) fullpath = unit.path
      else if (unit.dir || deffo('dir')) {
        const dir = unit.dir || deffo('dir')
        if (unit.ext && unit.name) {
          fullpath = path.join(dir, unit.name + '.' + unit.ext)
        } else if (unit.base) {
          fullpath = path.join(dir, unit.base)
        } else {
          if (unit.name) {
            fullpath = path.join(dir, unit.name + '.' + deffo('ext'))
          } else if (unit.ext) {
            fullpath = path.join(dir, deffo('name') + '.' + unit.ext)
          } else {
            fullpath = path.join(dir, deffo('name') + '.' + deffo('ext'))
          }
        }
      }

      try {
        fs.statSync(path.dirname(fullpath))
      } catch (error) {
        if (error.code === 'ENOENT') {
          fs.mkdirSync(path.dirname(fullpath), { recursive: true })
        } else {
          throw error
        }
      }
      return fullpath
    }
    function encordingResolver (mode:string) {
      function deffo (prpty:string) {
        let default1 = {}
        let default2 = {}
        let default3 = {}
        if (mode === 'ClientBinaryFullpath' || mode === 'ClientTextFullpath') {
          if (option?.log?.client?.default)default1 = option.log.client.default
          default3 =
        mode === 'ClientBinaryFullpath' ? DefaultOption.log.client.bin
          : mode === 'ClientTextFullpath' ? DefaultOption.log.client.txt
            : DefaultOption.log.default
        }
        if (mode === 'HostBinaryFullpath' || mode === 'HostTextFullpath') {
          if (option?.log?.host?.default)default1 = option.log.host.default
          default3 =
        mode === 'HostBinaryFullpath' ? DefaultOption.log.host.bin
          : mode === 'HostTextFullpath' ? DefaultOption.log.host.txt
            : DefaultOption.log.default
        }
        if (option?.log?.default)default2 = option.log.default
        return default1[prpty] || default2[prpty] || default3[prpty]
      }
      let encording = ''
      const unit =
    mode === 'ClientBinaryFullpath' ? option.log.client.bin
      : mode === 'ClientTextFullpath' ? option.log.client.txt
        : mode === 'HostBinaryFullpath' ? option.log.host.bin
          : mode === 'HostTextFullpath' ? option.log.host.txt
            : null
      if (unit.encording) encording = unit.encording
      else {
        encording = deffo('encording')
      }
      return encording
    }
    this.ClientBinaryFullpath = pathResolver('ClientBinaryFullpath')
    this.ClientBinaryEncording = encordingResolver('ClientBinaryFullpath')
    this.ClientTextFullpath = pathResolver('ClientTextFullpath')
    this.ClientTextEncording = encordingResolver('ClientTextFullpath')
    this.HostBinaryFullpath = pathResolver('HostBinaryFullpath')
    this.HostBinaryEncording = encordingResolver('HostBinaryFullpath')
    this.HostTextFullpath = pathResolver('HostTextFullpath')
    this.HostTextEncording = encordingResolver('HostTextFullpath')
  }
}
export class Logger {
  client:t.Log
  host:t.Log
  loggerOption:LoggerOption
  constructor (session) {
    function pathReplacer (path:string) {
      return path.replace(/{session}/g, session)
    }
    this.loggerOption = new LoggerOption(config)
    this.client = {
      bin: this.loggerOption.ClientBinaryFullpath === null
        ? null : fs.createWriteStream(
          pathReplacer(this.loggerOption.ClientBinaryFullpath),
          this.loggerOption.ClientBinaryEncording
        ),
      txt:
        this.loggerOption.ClientTextFullpath === null
          ? null : fs.createWriteStream(
            pathReplacer(this.loggerOption.ClientTextFullpath),
            this.loggerOption.ClientTextEncording
          )
    }

    this.host = {
      bin:
            this.loggerOption.HostBinaryFullpath === null
              ? null : fs.createWriteStream(
                pathReplacer(this.loggerOption.HostBinaryFullpath),
                this.loggerOption.HostBinaryEncording
              ),
      txt: this.loggerOption.HostBinaryEncording === null
        ? null : fs.createWriteStream(
          pathReplacer(this.loggerOption.HostTextFullpath),
          this.loggerOption.HostTextEncording
        )
    }
  }

  write (buf, option) {
    const mainWrite=target => {
      const str = typeof buf === 'string' ? buf : buf.toString()
      if (target.bin) target.bin.write(Array.from(buf).join(' ') + '\n')
      if (target.txt) target.txt.write(str)
    }
    if (option === 'input' && this.client) {
      mainWrite(this.client)
    } else if (option === 'output' && this.host) {
      mainWrite(this.host)
    }
  }

  close () {
    ((targets)=>{
      targets.forEach(target => {
        if (target.bin) target.bin.close()
        if (target.txt) target.txt.close()        
      });
    })([this.client,this.host])
  }
}

export class LibCommon {
  constructor () {
    this.Logger = Logger
  }

  Logger
}
