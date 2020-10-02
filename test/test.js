function test (stream) {
  stream.write('ctrl+c ends this test\n');
  stream.on('data', buf => {
    console.log(buf)
    if (buf[0] == 3) {
      stream.exit(0);
      stream.end();
      clearInterval(intervalObj)
    }
  })
  const intervalObj = setInterval(() => stream.write('.'), 700);
}

require('./ssh').then(test)
require('./telnet').then(test)
