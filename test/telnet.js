var telnet = require('telnet')
module.exports = new Promise((resolve, reject) => {
  try {
    telnet.createServer(function (client) {
      // make unicode characters work properly
      client.do.transmit_binary()

      // make the client emit 'window size' events
      client.do.window_size()

      // listen for the window size events from the client
      client.on('window size', function (e) {
        if (e.command === 'sb') {
          console.log('telnet window resized to %d x %d', e.width, e.height)
        }
      })

      client.on('error', function(e) {
        if(e.code === "ECONNRESET") {
            console.log("Client quit unexpectedly; ignoring exception.");
        } else {
            console.log("Exception encountered:");
            console.log(e.code);
            process.exit(1);
        }
      });

      resolve(client)
    }).listen(0, '127.0.0.1', function () {
      console.log('Telnet server Listening on port ' + this.address().port);
    });
  } catch (err) {
    reject(err)
  }
})