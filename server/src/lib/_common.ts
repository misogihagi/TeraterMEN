import * as fs from 'fs'
import * as t from 'teratermen'
import * as path from 'path'
import * as config from '../../server.conf.js'

function deffo (mode, option, prpty:string) {
  let default1 = {}
  let default2 = {}
  let default3 = {}
  function defaultGen(destination, binfullpath,txtfullpath) {
    if (mode === binfullpath || mode === txtfullpath) {
      if (option?.log[destination].default)default1 = option.log[destination].default
      default3 =
      mode === binfullpath ? DefaultOption.log[destination].bin
        : mode === txtfullpath ? DefaultOption.log[destination].txt
          : DefaultOption.log.default
    }      
  }
  defaultGen("client","ClientBinaryFullpath","ClientTextFullpath")
  defaultGen("host","HostBinaryFullpath","HostTextFullpath")
  if (option?.log?.default)default2 = option.log.default
  return default1[prpty] || default2[prpty] || default3[prpty]
}

export const DefaultOption = (()=>{
  const now=Date.now().toString()
  const dir =path.join(__dirname, '/../../log/')
  function file(ext,mode?){
    return {
      dir: dir,
      ext: ext,
      name: now + (mode ? '_{session}_' + mode : '')
    }
  }
function log(mode){
    return {
      bin: file('bin.txt',mode),
      txt: file('txt',mode),
    }
  }
  const de=file('log.txt')
  de['encordng']='utf-8'
  const res={
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
    function unitGen(mode:string):t.unitOption {
      return mode === 'ClientBinaryFullpath' ? option.log.client.bin
        : mode === 'ClientTextFullpath' ? option.log.client.txt
          : mode === 'HostBinaryFullpath' ? option.log.host.bin
            : mode === 'HostTextFullpath' ? option.log.host.txt
              : null

    }

    function pathResolver (mode:string) {
      let fullpath = ''
      const unit=unitGen(mode)
      if (unit.path) fullpath = unit.path
      else if (unit.dir || deffo(mode, option, 'dir')) {
        const dir = unit.dir || deffo(mode, option, 'dir')
        if (unit.ext && unit.name) {
          fullpath = path.join(dir, unit.name + '.' + unit.ext)
        } else if (unit.base) {
          fullpath = path.join(dir, unit.base)
        } else {
          if (unit.name) {
            fullpath = path.join(dir, unit.name + '.' + deffo(mode, option, 'ext'))
          } else if (unit.ext) {
            fullpath = path.join(dir, deffo(mode, option, 'name') + '.' + unit.ext)
          } else {
            fullpath = path.join(dir, deffo(mode, option, 'name') + '.' + deffo(mode, option, 'ext'))
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
      let encording = ''
      const unit =unitGen(mode)
      if (unit.encording) encording = unit.encording
      else {
        encording = deffo(mode, option, 'encording')
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
    type mode="client" | "host"
    const createLogStream = (mode:mode):t.Log=>{
      const binfullpath = mode === "client" ? this.loggerOption.ClientBinaryFullpath : this.loggerOption.HostBinaryFullpath
      const txtfullpath = mode === "client" ? this.loggerOption.ClientTextFullpath : this.loggerOption.HostTextFullpath
      const binencording=  mode === "client" ? this.loggerOption.ClientBinaryEncording : this.loggerOption.HostBinaryEncording
      const txtencording=  mode === "client" ? this.loggerOption.ClientTextEncording : this.loggerOption.HostTextEncording
      function createStream(fullpath, encording){
        return fullpath === null
          ? null : fs.createWriteStream(
            pathReplacer(fullpath),
            encording
          )
      }
      return {
        bin: createStream(binfullpath, binencording),
        txt: createStream(txtfullpath, txtencording),
      }
    }
    this.loggerOption = new LoggerOption(config)
    this.client = createLogStream("client")
    this.host = createLogStream("host")
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
