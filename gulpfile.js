const gulp = require("gulp");
const gulpIf = require('gulp-if');
const run = require('gulp-run');

const { exec } = require('child_process');
const ts = require("gulp-typescript");
const clientTsProject = ts.createProject('./client/tsconfig.json');
const serverTsProject = ts.createProject('./server/tsconfig.json');
const eslint = require('gulp-eslint');

require('dotenv').config()
Array.from(['env','platform']).forEach((v,i) => {
    process.env[i]=process.env[v]
});
const [env,platform]=process.argv.slice(3).reduce(
    (acc, cur) => {
        if(['--prod','prod','production'].includes(cur)){
            acc[0]='production'
            return acc
        }else if(['--dev','dev','development'].includes(cur)){
            acc[0]='development'
            return acc
        }else if(['--elctr','electron','electron'].includes(cur)){
            acc[1]='electron'
            return acc
        }else if(['--expr','express','express'].includes(cur)){
            acc[1]='express'
            return acc
        }
    },new Array(2).fill(null)
).map((v,i)=>{
    process.env[i]=v || process.env[i] || ['development','express'][i]
    return process.env[i]
})

gulp.task("install", (done) => {
  exec('cd client && npm install' , function (err, stdout, stderr) {
    if(err)console.log(err);
    done()
  });
  exec('cd server && npm install' , function (err, stdout, stderr) {
    if(err)console.log(err);
    done()
  });
});
gulp.task("build:client", (done) => {
  exec('cd client && npm run build' , function (err, stdout, stderr) {
    if(err)console.log(err);
    done()
  });
});
gulp.task("build:server", function() {
  return serverTsProject.src()
    .pipe(serverTsProject())
    .js.pipe(gulp.dest('server/dist'));
});
gulp.task('lint:client', () => {
    return gulp.src(['client/src/**/*.svelte','client/src/**/*.ts'])
        .pipe(eslint({ useEslintrc: true }))
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});
gulp.task('lint:server', () => {
    return gulp.src(['server/src/**/*.ts'])
        .pipe(eslint({ useEslintrc: true }))
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});
gulp.task('lint:client:fix', () => {
    return gulp.src(['client/src/**/*.svelte','client/src/**/*.ts'])
        .pipe(eslint({ useEslintrc: true }))
        .pipe(eslint({fix:true}))
        .pipe(eslint.format())
        .pipe(gulpIf(f=>{return f.eslint && f.eslint.fixed},
          gulp.dest('client/src/')))
        .pipe(eslint.failAfterError());
});
gulp.task('lint:server:fix', () => {
    return gulp.src(['server/src/**/*.ts'])
        .pipe(eslint({ useEslintrc: true }))
        .pipe(eslint({fix:true}))
        .pipe(eslint.format())
        .pipe(gulpIf(f=>{return f.eslint && f.eslint.fixed},
          gulp.dest('server/src/')))
        .pipe(eslint.failAfterError());
});
gulp.task('watch:client', () => {
  const watcher = gulp.watch('client/src/*.*', gulp.parallel('build:client'));
  watcher.on('change', function(event) {
    console.log('File ' + event + ' was changed...');
  });
});
gulp.task('watch:server', () => {
  const watcher = gulp.watch('server/src/*.*', gulp.parallel('build:server'));
  watcher.on('change', function(event) {
    console.log('File ' + event + ' was changed...');
  });
});
gulp.task('build',
    gulp.parallel(
        'build:client',
        'build:server'
    )
);
gulp.task('build:electron',
    gulp.series(
      'build',
      (done)=>{return electronBuilder({
        config: {
            'appId': 'teratermen',
            'asar':false,
            'win':{
                'target': {
                    'target': 'zip',
                    'arch': [
                        'x64',
                        'ia32',
                    ]
                }
            }
        }
      })}
    )
);
gulp.task('lint',
    gulp.parallel(
        'lint:client',
        'lint:server'
    )
);
gulp.task('watch',
    gulp.parallel(
        'watch:client',
        'watch:server'
    )
);
gulp.task('start', 
    gulp.series(
      'build',
      (done)=>{
        const port = process.env.PORT || 3000;
        console.log('listening on http://localhost:' + port);
        return run('node server/dist/express').exec();
      }
    )
);

//gulp.task("default", gulp.task("start"));