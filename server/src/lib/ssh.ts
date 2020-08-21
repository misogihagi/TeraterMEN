import { LibCommon } from './_common.js'

export class Ssh extends LibCommon {
  hosts
  logger
  constructor (host:string) {
    super()
    this.hosts = []
  }

  connect (config) {
    const host = new (require('ssh2').Client)()
    host.logger = new this.logger()
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
        kex: [
          'curve25519-sha256',
          'curve25519-sha256@libssh.org',
          'ecdh-sha2-nistp256',
          'ecdh-sha2-nistp384',
          'ecdh-sha2-nistp521',
          'diffie-hellman-group-exchange-sha1',
          'diffie-hellman-group-exchange-sha256',
          'diffie-hellman-group1-sha1',
          'diffie-hellman-group14-sha1',
          'diffie-hellman-group14-sha256',
          'diffie-hellman-group16-sha512',
          'diffie-hellman-group18-sha512'
        ],
        cipher: [
          'aes128-ctr',
          'aes192-ctr',
          'aes256-ctr',
          'aes128-gcm',
          'aes128-gcm@openssh.com',
          'aes256-gcm',
          'aes256-gcm@openssh.com',
          'aes256-cbc',
          'aes192-cbc',
          'aes128-cbc',
          'blowfish-cbc',
          '3des-cbc',
          'arcfour256',
          'arcfour128',
          'cast128-cbc',
          'arcfour'
        ]
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
