const gulp = require("gulp");
const gulpIf = require('gulp-if');
const run = require('gulp-run');

const ts = require("gulp-typescript");
const clientTsProject = ts.createProject('./client/tsconfig.json');
const serverTsProject = ts.createProject('./server/tsconfig.json');
const eslint = require('gulp-eslint')

gulp.task("build:client", function() {
  return clientTsProject.src()
    .pipe(clientTsProject())
    .js.pipe(gulp.dest('client/public/build'));
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
);
gulp.task('lint',
    gulp.parallel(
        'lint:client',
        'lint:server'
    )
);
gulp.task('start', 
    gulp.series(
      'build',
      (done)=>{return run('node server/dist/index').exec()}
    )
);

//gulp.task("default", gulp.task("start"));