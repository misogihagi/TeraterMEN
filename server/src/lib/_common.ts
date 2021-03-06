import * as fs from 'fs'
import * as t from 'teratermen'
import * as path from 'path'
import * as config from '../../server.conf.js'
function mkdirIfnotexistSync (fullpath) {
  if (!fs.existsSync(fullpath)) { fs.mkdirSync(fullpath, { recursive: true }) }
}
class Utils {
  option
  mode
  constructor (option) {
    this.option = option
  }

  deffo (prpty:string) {
    let default1 = {}
    let default2 = {}
    let default3 = {}
    const mode = this.mode
    const defaultGen = (destination, binfullpath, txtfullpath) => {
      if (mode === binfullpath || mode === txtfullpath) {
        if (this.option?.log[destination].default)default1 = this.option.log[destination].default
        default3 =
        mode === binfullpath ? DefaultOption.log[destination].bin
          : mode === txtfullpath ? DefaultOption.log[destination].txt
            : DefaultOption.log.default
      }
    }
    defaultGen('client', 'ClientBinaryFullpath', 'ClientTextFullpath')
    defaultGen('host', 'HostBinaryFullpath', 'HostTextFullpath')
    if (this.option?.log?.default)default2 = this.option.log.default
    return default1[prpty] || default2[prpty] || default3[prpty]
  }

  unitGen (mode:string):t.unitOption {
    const destination = mode.match(/^Client/) ? 'client' : 'host'
    const format = mode.match('Binary') ? 'bin' : 'txt'
    return this.option.log[destination][format]
  }

  noDefaultNamePathResolver (unit, dir):string {
    if (unit.name) {
      return path.join(dir, unit.name + '.' + this.deffo('ext'))
    } else if (unit.ext) {
      return path.join(dir, this.deffo('name') + '.' + unit.ext)
    } else {
      return path.join(dir, this.deffo('name') + '.' + this.deffo('ext'))
    }
  }

  namePathResolver (unit:t.unitOption, dir:string):string {
    if (unit.ext && unit.name) {
      return path.join(dir, unit.name + '.' + unit.ext)
    } else if (unit.base) {
      return path.join(dir, unit.base)
    } else {
      return this.noDefaultNamePathResolver(unit, dir)
    }
  }

  pathResolver (mode:string) {
    let fullpath = ''
    this.mode = mode
    const unit = this.unitGen(mode)
    if (unit.path) fullpath = unit.path
    else if (unit.dir || this.deffo('dir')) {
      const dir = unit.dir || this.deffo('dir')
      fullpath = this.namePathResolver(unit, dir)
    }
    mkdirIfnotexistSync(path.dirname(fullpath))
    return fullpath
  }

  encordingResolver (mode:string) {
    let encording = ''
    this.mode = mode
    const unit = this.unitGen(mode)
    if (unit.encording) encording = unit.encording
    else {
      encording = this.deffo('encording')
    }
    return encording
  }
}

export const DefaultOption = (() => {
  const now = Date.now().toString()
  const dir = path.join(__dirname, '/../../log/')
  function file (ext, mode?) {
    return {
      dir: dir,
      ext: ext,
      name: now + (mode ? '_{session}_' + mode : '')
    }
  }
  function log (mode) {
    return {
      bin: file('bin.txt', mode),
      txt: file('txt', mode)
    }
  }
  const de = file('log.txt')
  de["encording"] = 'utf-8'
  const res = {
    log: {
      default: de,
      client: log('client'),
      host: log('host')
    }
  }
  return res
})()

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
    const utils = new Utils(option)
    this.ClientBinaryFullpath = utils.pathResolver('ClientBinaryFullpath')
    this.ClientBinaryEncording = utils.encordingResolver('ClientBinaryFullpath')
    this.ClientTextFullpath = utils.pathResolver('ClientTextFullpath')
    this.ClientTextEncording = utils.encordingResolver('ClientTextFullpath')
    this.HostBinaryFullpath = utils.pathResolver('HostBinaryFullpath')
    this.HostBinaryEncording = utils.encordingResolver('HostBinaryFullpath')
    this.HostTextFullpath = utils.pathResolver('HostTextFullpath')
    this.HostTextEncording = utils.encordingResolver('HostTextFullpath')
  }
}
function createStream (fullpath, encording, session) {
  function pathReplacer (path:string, session) {
    return path.replace(/{session}/g, session)
  }
  return fullpath === null
    ? null : fs.createWriteStream(
      pathReplacer(fullpath, session),
      encording
    )
}

export class Logger {
  client:t.Log
  host:t.Log
  loggerOption:LoggerOption
  createLogStream (mode:string, session):t.Log {
    const binfullpath = mode === 'client' ? this.loggerOption.ClientBinaryFullpath : this.loggerOption.HostBinaryFullpath
    const txtfullpath = mode === 'client' ? this.loggerOption.ClientTextFullpath : this.loggerOption.HostTextFullpath
    const binencording = mode === 'client' ? this.loggerOption.ClientBinaryEncording : this.loggerOption.HostBinaryEncording
    const txtencording = mode === 'client' ? this.loggerOption.ClientTextEncording : this.loggerOption.HostTextEncording
    return {
      bin: createStream(binfullpath, binencording, session),
      txt: createStream(txtfullpath, txtencording, session)
    }
  }

  constructor (session) {
    type mode='client' | 'host'
    this.loggerOption = new LoggerOption(config)
    this.client = this.createLogStream('client', session)
    this.host = this.createLogStream('host', session)
  }

  binwrite (bin:fs.WriteStream, buf) {
    bin.write(Array.from(buf).join(' ') + '\n')
  }

  txtwrite (txt:fs.WriteStream, buf) {
    const str = typeof buf === 'string' ? buf : buf.toString()
    txt.write(str)
  }

  write (buf, option) {
    const mainWrite = target => {
      this.binwrite(target.bin, buf)
      this.txtwrite(target.txt, buf)
    }
    if (option === 'input' && this.client) {
      mainWrite(this.client)
    } else if (option === 'output' && this.host) {
      mainWrite(this.host)
    }
  }

  close () {
    ((targets) => {
      targets.forEach(target => {
        if (target.bin) target.bin.close()
        if (target.txt) target.txt.close()
      })
    })([this.client, this.host])
  }
}

export class LibCommon {
  constructor () {
    this.Logger = Logger
  }

  Logger
}
