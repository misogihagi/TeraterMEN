import * as t from 'teratermen'
import { LibCommon } from './_common.js'
import * as ssh2streams from 'ssh2-streams'
const ALGORITHMS = ssh2streams.constants.ALGORITHMS

export class Ssh extends LibCommon {
  hosts
  constructor () {
    super()
    this.hosts = []
  }

  connect (config) {
    const host = new (require('ssh2').Client)()
    host.logger = new this.Logger(config.session)
    host.on('ready', function () {
      config.onconnect()
      host.shell(function (err, stream) {
        if (err) throw err
        stream.on('close', function () {
          host.end()
        })
          .on('data', (buf:Buffer) => {
            config.ondata(buf)
            host.logger.write(buf, 'output')
          })
          .stderr.on('data', (buf:Buffer) => {
            config.ondata(buf)
            host.logger.write(buf, 'output')
          })
        host._stream = stream
      })
    }).on('session', (aa, s, d) => {
    }).connect({
      host: config.host,
      port: config.port || 22,
      username: config.username || '',
      password: config.password || '',
      algorithms: {
        kex: ALGORITHMS.SUPPORTED_KEX,
        cipher: ALGORITHMS.SUPPORTED_CIPHER
      }
    })
    host.write = buf => {
      host._stream.write(buf)
      host.logger.write(buf, 'input')
    }
    this.hosts.push(host)
    return host
  }
}
