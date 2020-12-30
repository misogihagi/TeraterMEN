const { execSync } = require('child_process')

const stdout = execSync('npx tsc --project tsconfig.json')
const a=require( '../dist/lib/_common')
const config1={
    log:{
      default:{},
    client:{
        bin:{
            path:'./c.txt',
            dir: './clidir/',
            ext: 'bin.txt',
        },
        txt:{
            dir: './clidir/',
            ext: 'bin.txt',
            name: 'bin.txt',
        },
    },
    host:{
        default:{
            name: Date.now().toString()+'_{session}',
        },
        bin:{
            dir: './log/asd',
            name: 'bin.txt',
        },
        txt:{
        },
    }
}
}
const config2={
    log:{
      default:{
        path:'./c.txt',
        dir: './clidir/',
        ext: 'bin.txt',
      },
    client:{
        bin:{
            path:'./c.txt',
            dir: './clidir/',
            ext: 'bin.txt',
        },
        txt:{
            dir: './clidir/',
            ext: 'bin.txt',
            name: 'bin.txt',
        },
    },
    host:{
        default:{
            name: Date.now().toString()+'_{session}',
        },
        bin:{
            dir: './log/asd',
            name: 'bin.txt',
        },
        txt:{
        },
    }
}
}
const assert = require('assert');
describe('config', () => {
  it('config1', () => {
    const logger=new a.LoggerOption(config1)
    assert.equal(logger.ClientBinaryFullpath,'./c.txt');
    assert.equal(logger.ClientTextFullpath,'clidir\\bin.txt.bin.txt');
    assert.equal(logger.HostBinaryFullpath,'log\\asd\\bin.txt.bin.txt');
//    assert.equal(logger.HostTextFullpath,'..\\..\\log\\1598418438536_{session}_host.txt');
  });
  it('config2', () => {
    const logger=new a.LoggerOption(config2)
    assert.equal(logger.ClientBinaryFullpath,'./c.txt');
    assert.equal(logger.ClientTextFullpath,'clidir\\bin.txt.bin.txt');
    assert.equal(logger.HostBinaryFullpath,'log\\asd\\bin.txt.bin.txt');
//    assert.equal(logger.HostTextFullpath,'clidir\\1598426159576_{session}_host.bin.txt');
  });
});

