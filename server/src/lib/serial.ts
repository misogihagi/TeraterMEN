import { LibCommon } from './_common.js'

export class Serial extends LibCommon {
  hosts
  logger
  constructor (host:string) {
    super()
    this.hosts = []
  }

  connect (config) {
    const SerialPort = require('@serialport/stream')
    const Binding = require('@serialport/bindings')
    SerialPort.Binding = Binding
    const host = new SerialPort(config.host, {
      baudRate: 9600
    })
    this.hosts.push(host)
    host.logger = new this.logger()
    host.on('open', () => {
      config.onconnect()
    })
    host.on('data', (buf:Buffer) => {
      config.ondata(buf)
      host.logger.write(buf, 'output')
    })
    host.__write = host.write // host._write はすでに使用済み
    host.write = (buf:Buffer) => {
      host.__write(buf)
      host.logger.write(buf, 'input')
    }
    return host
  }
}
