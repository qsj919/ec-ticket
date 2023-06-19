
function deployRemote(config) {
  var Client = require('ssh2').Client

  var conn = new Client()
  conn
    .on('ready', function() {
      console.log('Client :: ready')
      conn.shell(function(err, stream) {
        if (err) throw err
        stream
          .on('close', function() {
            console.log('Stream :: close')
            conn.end()
          })
          .on('data', function(data) {
            console.log(data.toString())
          })
        stream.end(`${config.command}\nexit\n`)
      })
    })
    .connect({
      host: config.host,
      port: config.port,
      username: config.username,
      password: config.password
    })
}

const sshConfig = {
  host: '122.112.255.39',
  port: 9231,
  username: 'dev',
  password: 'dev2009',
  command: `./front cs3d2_webdoc1 'ec-web-doc'`
}
deployRemote(sshConfig)
