module.exports = {
    log: {
      default: {
        /**
         * The full directory path such as '/home/user/dir' or 'c:\path\dir'
         */
        dir: __dirname + '/log/',
        /**
         * The file name including extension (if any) such as 'index.html'
         */
        // base: 'log.txt',
        /**
         * The file extension (if any) such as '.html'
         */
        ext: 'txt',
        /**
         * The file name without extension (if any) such as 'index'
         */
        name: Date.now().toString(),
        /**
         * The full path such (if any) as '/home/user/dir/index.html' or 'c:\path\dir\index.html'
         * override the other options (dir,ext,name)
         */
        // path:'',
        encording: 'utf-8',
      },
      client: {
        bin: {
          dir: __dirname + '/log/',
          ext: 'bin.txt',
          name: Date.now().toString() + '_{session}_client',
        },
        txt: {
          name: Date.now().toString() + '_{session}_client',
        },
      },
      host: {
        default: {
          name: Date.now().toString() + '_{session}_host',
        },
        bin: {
          ext: 'bin.txt',
        },
        txt: {},
      }
    }
  }