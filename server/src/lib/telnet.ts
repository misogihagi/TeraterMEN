import { LibCommon } from './_common.js'

export class Telnet extends LibCommon {
  hosts
  logger
  constructor (host:string) {
    super()
    this.hosts = []
  }

  connect (config) {
    const host = new (require('telnet-client'))()
    host.logger = new this.logger()
    host.connect({
      host: config.host,
      port: config.port || 23,
      username: config.username || '',
      password: config.password || '',
      negotiationMandatory: false
    }).then(() => {
      config.onconnect()
      const stream = host.socket
      stream.on('close', function () {
        host.end()
      })
      stream.on('data', (buf:Buffer) => {
        config.ondata(buf)
        host.logger.write(buf, 'output')
      })
      host._stream = stream
    }).catch(e => { throw e })
    host.write = buf => {
      host._stream.write(buf)
      host.logger.write(buf, 'input')
    }
    this.hosts.push(host)

    return host
  }
}
