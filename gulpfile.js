const gulp = require("gulp");
const gulpIf = require('gulp-if');
const run = require('gulp-run');
const {
  exec
} = require('child_process');
const ts = require("gulp-typescript");
const clientTsProject = ts.createProject('./client/tsconfig.json');
const serverTsProject = ts.createProject('./server/tsconfig.json');
const mocha = require('gulp-ts-mocha');
const eslint = require('gulp-eslint');
const webpackStream = require("webpack-stream");
const webpack = require("webpack");
const webpackConfig = require("./server/webpack.config");
const electronBuilder = require('electron-builder');
const fs = require('fs')
const version = require('package.json').version
const { Octokit } = require("@octokit/rest");

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
})
  
require('dotenv').config()
Array.from(['env', 'platform']).forEach((v, i) => {
  process.env[i] = process.env[v]
});
const [env, platform] = process.argv.slice(3).reduce(
  (acc, cur) => {
    if (['--prod', 'prod', 'production'].includes(cur)) {
      acc[0] = 'production'
      return acc
    } else if (['--dev', 'dev', 'development'].includes(cur)) {
      acc[0] = 'development'
      return acc
    } else if (['--elctr', 'electron', 'electron'].includes(cur)) {
      acc[1] = 'electron'
      return acc
    } else if (['--expr', 'express', 'express'].includes(cur)) {
      acc[1] = 'express'
      return acc
    }
  }, new Array(2).fill(null)).map((v, i) => {
  process.env[i] = v || process.env[i] || ['development', 'express'][i]
  return process.env[i]
})
gulp.task("install", gulp.parallel(
  (done) => {
    exec('cd client && npm install', function (err, stdout, stderr) {
      if (err) console.log(err);
      done()
    })
  }, (done) => {
    exec('cd server && npm install', function (err, stdout, stderr) {
      if (err) console.log(err);
      done()
    })
  }));
gulp.task("build:client", (done) => {
  exec('cd client && npm run build', function (err, stdout, stderr) {
    if (err) console.log(err);
    done()
  });
});
gulp.task("build:server", function () {
  return serverTsProject.src().pipe(serverTsProject()).js.pipe(gulp.dest('server/dist'));
});
gulp.task('lint:client', () => {
  return gulp.src(['client/src/**/*.svelte', 'client/src/**/*.ts']).pipe(eslint({
    useEslintrc: true
  })).pipe(eslint.format()).pipe(eslint.failAfterError());
});
gulp.task('lint:server', () => {
  return gulp.src(['server/src/**/*.ts']).pipe(eslint({
    useEslintrc: true
  })).pipe(eslint.format()).pipe(eslint.failAfterError());
});
gulp.task('lint:client:fix', () => {
  return gulp.src(['client/src/**/*.svelte', 'client/src/**/*.ts']).pipe(eslint({
    useEslintrc: true
  })).pipe(eslint({
    fix: true
  })).pipe(eslint.format()).pipe(gulpIf(f => {
    return f.eslint && f.eslint.fixed
  }, gulp.dest('client/src/'))).pipe(eslint.failAfterError());
});
gulp.task('lint:server:fix', () => {
  return gulp.src(['server/src/**/*.ts']).pipe(eslint({
    useEslintrc: true
  })).pipe(eslint({
    fix: true
  })).pipe(eslint.format()).pipe(gulpIf(f => {
    return f.eslint && f.eslint.fixed
  }, gulp.dest('server/src/'))).pipe(eslint.failAfterError());
});
gulp.task('test:client', () => {
  return gulp.src('client/test/*.ts', {
    read: false
  }).pipe(mocha({
    project: 'client/tsconfig.json'
  }))
});
gulp.task('test:server', () => {
  return gulp.src('server/test/*.ts', {
    read: false
  }).pipe(mocha({
    project: 'server/tsconfig.json'
  }))
});
gulp.task('watch:client', () => {
  const watcher = gulp.watch('client/src/*.*', gulp.parallel('build:client'));
  watcher.on('change', function (event) {
    console.log('File ' + event + ' was changed...');
  });
});
gulp.task('watch:server', () => {
  const watcher = gulp.watch('server/src/*.*', gulp.parallel('build:server'));
  watcher.on('change', function (event) {
    console.log('File ' + event + ' was changed...');
  });
});
gulp.task('build', gulp.parallel('build:client', 'build:server'));
gulp.task('build:electron', gulp.series(
  (done) => {
    fs.copyFileSync('./.env', './.env.bak');
    process.env.platform = 'electron'
    fs.writeFileSync("./.env", 'env=' + process.env.env + '\n' + 'platform=' + process.env.platform + '\n')
    done()
  }, 'build', (done) => {
    return webpackStream(webpackConfig, webpack).pipe(gulp.dest("server/dist"));
  }, (done) => {
    electronBuilder.build({
      config: {
        'appId': 'teratermen',
        'asar': false,
        'win': {
          'target': {
            'target': 'zip',
            'arch': ['x64', 'ia32', ]
          }
         },
        'linux':{
          'target':'zip'
         },
        'mac':{
          'target':'zip'
        },
        "extraMetadata": {
          "main": "./server/dist/electron.webpack.js"
        },
      }
    })
    done()
  }, (done) => {
    fs.copyFileSync('./.env.bak', './.env')
    fs.unlinkSync('./.env.bak')
    console.log(fs.readdirSync('.'))
    done()
  }));
gulp.task('lint', gulp.parallel('lint:client', 'lint:server'));
gulp.task('pack', gulp.parallel('build:electron'));
gulp.task('test', gulp.series('build', 'test:client', 'test:server'));
gulp.task('watch', gulp.parallel('watch:client', 'watch:server'));
gulp.task('release', gulp.series(
  'pack',
  (done) => {
    octokit.repos.createRelease({
      owner: "misogihagi",
      repo: "Teratermen",
      tag_name: versiom
    }).then(result=>{
      return octokit.request({
          method: "POST",
          url: result.upload_url,
          headers: {
            "content-type": "application/zip",
          },
          data: fs.readFileSync(`teratermen-${version}-win.zip`),
          name: `teratermen-${version}-win.zip`,
      })
    }).then(
      ()=>done()
    )
  }
)
gulp.task('start', gulp.series('build', (done) => {
  const port = process.env.PORT || 3000;
  console.log('listening on http://localhost:' + port);
  return run('node server/dist/express').exec();
}));
//gulp.task("default", gulp.task("start"));
