'use strict';

import _ from 'lodash';
import del from 'del';
import gulp from 'gulp';
import path from 'path';
import through2 from 'through2';
import gulpLoadPlugins from 'gulp-load-plugins';
import http from 'http';
import open from 'open';
import lazypipe from 'lazypipe';
import nodemon from 'nodemon';
import runSequence from 'run-sequence';
import webpack from 'webpack-stream';
import makeWebpackConfig from './webpack.make';

var plugins = gulpLoadPlugins();
var config;

const clientPath = 'client';
const serverPath = 'server';
const paths = {
  client: {
    assets: `${clientPath}/assets/**/*`,
    images: `${clientPath}/assets/images/**/*`,
    revManifest: `${clientPath}/assets/rev-manifest.json`,
    scripts: [
      `${clientPath}/{app,components}/**/!(*.spec|*.mock).js`
    ],
    styles: [`${clientPath}/{app,components}/**/*.scss`],
    mainStyle: `${clientPath}/app/app.scss`,
    views: `${clientPath}/{app,components}/**/*.html`,
    mainView: `${clientPath}/index.html`
  },
  server: {
    scripts: [
      `${serverPath}/**/!(*.spec|*.integration).js`,
      `!${serverPath}/config/local.env.sample.js`
    ],
    json: [`${serverPath}/**/*.json`]
  },
  dist: 'dist'
};

/********************
 * Helper functions
 ********************/

function onServerLog(log) {
  console.log(plugins.util.colors.white('[') +
    plugins.util.colors.yellow('nodemon') +
    plugins.util.colors.white('] ') +
    log.message);
}

function checkAppReady(cb) {
  var options = {
    host: 'localhost',
    port: config.port
  };
  http
    .get(options, () => cb(true))
    .on('error', () => cb(false));
}

// Call page until first success
function whenServerReady(cb) {
  var serverReady = false;
  var appReadyInterval = setInterval(() =>
    checkAppReady((ready) => {
      if(!ready || serverReady) {
        return;
      }
      clearInterval(appReadyInterval);
      serverReady = true;
      cb();
    }),
    100);
}

/********************
 * Reusable pipelines
 ********************/

let lintClientScripts = lazypipe()
  .pipe(plugins.eslint, `${clientPath}/.eslintrc`)
  .pipe(plugins.eslint.format);

let lintServerScripts = lazypipe()
  .pipe(plugins.eslint, `${serverPath}/.eslintrc`)
  .pipe(plugins.eslint.format);

let transpileServer = lazypipe()
  .pipe(plugins.sourcemaps.init)
  .pipe(plugins.babel, {
    plugins: [
      'transform-class-properties',
      'transform-runtime'
    ]
  })
  .pipe(plugins.sourcemaps.write, '.');

/********************
 * Env
 ********************/

gulp.task('env:all', () => {
  let localConfig;
  try {
    localConfig = require(`./${serverPath}/config/local.env`);
  } catch(e) {
    localConfig = {};
  }
  plugins.env({
    vars: localConfig
  });
});
gulp.task('env:test', () => {
  plugins.env({
    vars: {
      NODE_ENV: 'test'
    }
  });
});
gulp.task('env:prod', () => {
  plugins.env({
    vars: {
      NODE_ENV: 'production'
    }
  });
});

/********************
 * Tasks
 ********************/

gulp.task('inject', cb => {
  runSequence(['inject:scss'], cb);
});

gulp.task('inject:scss', () => {
  return gulp.src(paths.client.mainStyle)
    .pipe(plugins.inject(
      gulp.src(_.union(paths.client.styles, ['!' + paths.client.mainStyle]), {
        read: false
      })
      .pipe(plugins.sort()), {
        transform: filepath => {
          let newPath = filepath
            .replace(`/${clientPath}/app/`, '')
            .replace(`/${clientPath}/components/`, '../components/')
            .replace(/_(.*).scss/, (match, p1, offset, string) => p1)
            .replace('.scss', '');
          return `@import '${newPath}';`;
        }
      }))
    .pipe(gulp.dest(`${clientPath}/app`));
});

gulp.task('webpack:dev', () => {
  const webpackDevConfig = makeWebpackConfig({DEV: true});
  return gulp.src(webpackDevConfig.entry.app)
    .pipe(plugins.plumber())
    .pipe(webpack(webpackDevConfig))
    .pipe(gulp.dest('.tmp'));
});

gulp.task('webpack:dist', () => {
  const webpackDistConfig = makeWebpackConfig({BUILD: true});
  return gulp.src(webpackDistConfig.entry.app)
    .pipe(webpack(webpackDistConfig))
    .pipe(gulp.dest(`${paths.dist}/client`));
});

gulp.task('transpile:server', () => {
  return gulp.src(_.union(paths.server.scripts))
    .pipe(transpileServer())
    .pipe(gulp.dest(`${paths.dist}/${serverPath}`));
});

gulp.task('lint:scripts', cb => runSequence(['lint:scripts:client', 'lint:scripts:server'], cb));

gulp.task('lint:scripts:client', () => {
  return gulp.src(_.union(paths.client.scripts))
    .pipe(lintClientScripts());
});

gulp.task('lint:scripts:server', () => {
  return gulp.src(_.union(paths.server.scripts))
    .pipe(lintServerScripts());
});

gulp.task('clean:tmp', () => del(['.tmp/**/*'], {
  dot: true
}));

gulp.task('start:client', cb => {
  whenServerReady(() => {
    open('http://localhost:' + config.browserSyncPort);
    cb();
  });
});

gulp.task('start:server', () => {
  process.env.NODE_ENV = process.env.NODE_ENV || 'development';
  config = require(`./${serverPath}/config/environment`);
  nodemon(`-w ${serverPath} ${serverPath}`)
    .on('log', onServerLog);
});

gulp.task('start:server:prod', () => {
  process.env.NODE_ENV = process.env.NODE_ENV || 'production';
  config = require(`./${paths.dist}/${serverPath}/config/environment`);
  nodemon(`-w ${paths.dist}/${serverPath} ${paths.dist}/${serverPath}`)
    .on('log', onServerLog);
});

gulp.task('watch', () => {

  plugins.watch(_.union(paths.server.scripts))
    .pipe(plugins.plumber())
    .pipe(lintServerScripts());
});

gulp.task('serve', cb => {
  runSequence(
    [
      'clean:tmp',
      'lint:scripts',
      'inject',
      'copy:fonts:dev',
      'env:all'
    ],
    // 'webpack:dev',
    ['start:server', 'start:client'],
    'watch',
    cb
  );
});

gulp.task('serve:dist', cb => {
  runSequence(
    'build',
    'env:all',
    'env:prod', ['start:server:prod', 'start:client'],
    cb);
});

/********************
 * Build
 ********************/

gulp.task('build', cb => {
  runSequence(
    [
      'clean:dist',
      'clean:tmp'
    ],
    'inject',
    'transpile:server',
    [
      'build:images'
    ],
    [
      'copy:extras',
      'copy:assets',
      'copy:fonts:dist',
      'copy:server',
      'webpack:dist'
    ],
    'revReplaceWebpack',
    cb);
});

gulp.task('clean:dist', () => del([`${paths.dist}/!(.git*|.openshift|Procfile)**`], {
  dot: true
}));

gulp.task('build:images', () => {
  return gulp.src(paths.client.images)
    .pipe(plugins.imagemin([
      plugins.imagemin.optipng({
        optimizationLevel: 5
      }),
      plugins.imagemin.jpegtran({
        progressive: true
      }),
      plugins.imagemin.gifsicle({
        interlaced: true
      }),
      plugins.imagemin.svgo({
        plugins: [{
          removeViewBox: false
        }]
      })
    ]))
    .pipe(plugins.rev())
    .pipe(gulp.dest(`${paths.dist}/${clientPath}/assets/images`))
    .pipe(plugins.rev.manifest(`${paths.dist}/${paths.client.revManifest}`, {
      base: `${paths.dist}/${clientPath}/assets`,
      merge: true
    }))
    .pipe(gulp.dest(`${paths.dist}/${clientPath}/assets`));
});

gulp.task('revReplaceWebpack', () => {
  return gulp.src('dist/client/app.*.js')
    .pipe(plugins.revReplace({
      manifest: gulp.src(`${paths.dist}/${paths.client.revManifest}`)
    }))
    .pipe(gulp.dest('dist/client'));
});

gulp.task('copy:extras', () => {
  return gulp.src([
    `${clientPath}/favicon.ico`,
    `${clientPath}/robots.txt`,
    `${clientPath}/.htaccess`
  ], {
    dot: true
  })
  .pipe(gulp.dest(`${paths.dist}/${clientPath}`));
});


/**
 * turns 'boostrap/fonts/font.woff' into 'boostrap/font.woff'
 */
function flatten() {
  return through2.obj(function(file, enc, next) {
    if(!file.isDirectory()) {
      try {
        let dir = path.dirname(file.relative).split(path.sep)[0];
        let fileName = path.normalize(path.basename(file.path));
        file.path = path.join(file.base, path.join(dir, fileName));
        this.push(file);
      } catch (e) {
        this.emit('error', new Error(e));
      }
    }
    next();
  });
}
gulp.task('copy:fonts:dev', () => {
  return gulp.src('node_modules/{bootstrap,font-awesome}/fonts/*')
    .pipe(flatten())
    .pipe(gulp.dest(`${clientPath}/assets/fonts`));
});
gulp.task('copy:fonts:dist', () => {
  return gulp.src('node_modules/{bootstrap,font-awesome}/fonts/*')
    .pipe(flatten())
    .pipe(gulp.dest(`${paths.dist}/${clientPath}/assets/fonts`));
});

gulp.task('copy:assets', () => {
  return gulp.src([paths.client.assets, '!' + paths.client.images])
    .pipe(gulp.dest(`${paths.dist}/${clientPath}/assets`));
});

gulp.task('copy:server', () => {
  return gulp.src([
    'package.json'
  ], {
    cwdbase: true
  })
  .pipe(gulp.dest(paths.dist));
});

