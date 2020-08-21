var fs = require('fs');
var crypto = require('crypto');
var inspect = require('util').inspect;

var ssh2 = require('ssh2');
var utils = ssh2.utils;

var allowedUser = Buffer.from('foo');
var allowedPassword = Buffer.from('bar');

const host_key='host.key';

var keygenPromise = require('ssh-keygen').keygenPromise;
 
(async ()=>{
 await ( async ()=>{

try {
  fs.statSync(host_key);
} catch(err) {
  if(err.code === 'ENOENT'){
    var keygen = require('ssh-keygen');
    var location = __dirname +'/'+host_key;
    var comment = 'joe@foobar.com';
    var password = ''; // false and undefined will convert to an empty pw
    var format = 'PEM'; // default is RFC4716
    await keygenPromise({
      location: location,
      comment: comment,
      password: password,
      read: true,
      format: format
    })
  }
}})()
var allowedPubKey = utils.parseKey(fs.readFileSync('host.key.pub'));

new ssh2.Server({
  hostKeys: [fs.readFileSync(host_key)]
}, function(client) {
   console.log('Client connected!');

  client.on('authentication', function(ctx) {
    var user = Buffer.from(ctx.username);
    if (user.length !== allowedUser.length
        || !crypto.timingSafeEqual(user, allowedUser)) {
      return ctx.reject();
    }

    switch (ctx.method) {
      case 'password':
        var password = Buffer.from(ctx.password);
        if (password.length !== allowedPassword.length
            || !crypto.timingSafeEqual(password, allowedPassword)) {
          return ctx.reject();
        }
        break;
      default:
        return ctx.reject();
    }

    ctx.accept();
  }).on('ready', function() {
    console.log('Client authenticated!');
    client.on('session', function(accept, reject) {
      var session = accept();
      session.on('pty',function(accept, reject, info) {
        accept()
        console.log('Client wants to pty');
      })
      session.on('shell',function(accept, reject, info) {
        var stream = accept();
        stream.write('ctrl+c ends this test\n');
        stream.on('data',buf=>{
          console.log(buf)
          if(buf[0]==3){
          stream.exit(0);
          stream.end();
          clearInterval(intervalObj)
          }
        })
        const intervalObj=setInterval(()=>stream.write('.'), 700);
      });
    });
  }).on('end', function() {
    console.log('Client disconnected');
  });
}).listen(0, '127.0.0.1', function() {
  console.log('Listening on port ' + this.address().port);
});


})()