"use strict";

// Load plugins
// gulp-autoprefixer 10 is ESM-only; reached here via Node's require(esm) interop
const autoprefixer = require("gulp-autoprefixer").default;
const browsersync = require("browser-sync").create();
const cleanCSS = require("gulp-clean-css");
const fs = require("fs/promises");
const gulp = require("gulp");
const header = require("gulp-header");
const plumber = require("gulp-plumber");
const rename = require("gulp-rename");
const sass = require("gulp-sass")(require("sass"));
const uglify = require("gulp-uglify");

// Load package.json for banner
const pkg = require('./package.json');

// Set the banner content
const banner = ['/*!\n',
  ' * <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n',
  ' * Copyright ' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
  ' * Licensed under <%= pkg.license %>\n',
  ' */\n',
  '\n'
].join('');

// BrowserSync
function browserSync(done) {
  browsersync.init({
    server: {
      baseDir: "./"
    },
    port: 3000,
    open: false,
    notify: false
  });
  done();
}

// BrowserSync reload
function browserSyncReload(done) {
  browsersync.reload();
  done();
}

// Clean vendor
function clean() {
  return fs.rm("./vendor/", { recursive: true, force: true });
}

// Bring third party dependencies from node_modules into vendor directory.
// Copied verbatim, so read as raw buffers rather than gulp 5's default utf8.
const asIs = { encoding: false };

function bootstrap() {
  return gulp.src('./node_modules/bootstrap/dist/**/*', asIs)
    .pipe(gulp.dest('./vendor/bootstrap'));
}

function jquery() {
  return gulp.src([
      './node_modules/jquery/dist/*',
      '!./node_modules/jquery/dist/core.js'
    ], asIs)
    .pipe(gulp.dest('./vendor/jquery'));
}

function jqueryEasing() {
  return gulp.src('./node_modules/jquery.easing/*.js', asIs)
    .pipe(gulp.dest('./vendor/jquery-easing'));
}

function lity() {
  return gulp.src('./node_modules/lity/dist/*', asIs)
    .pipe(gulp.dest('./vendor/lity'));
}

const modules = gulp.parallel(bootstrap, jquery, jqueryEasing, lity);

// CSS task
function css() {
  return gulp
    .src("./scss/**/*.scss")
    .pipe(plumber())
    .pipe(sass({
      outputStyle: "expanded",
      includePaths: "./node_modules",
    }))
    .on("error", sass.logError)
    .pipe(autoprefixer())
    .pipe(header(banner, {
      pkg: pkg
    }))
    .pipe(gulp.dest("./css"))
    .pipe(rename({
      suffix: ".min"
    }))
    .pipe(cleanCSS())
    .pipe(gulp.dest("./css"))
    .pipe(browsersync.stream());
}

// JS task
function js() {
  return gulp
    .src([
      './js/*.js',
      '!./js/*.min.js'
    ])
    // uglify-js >=3.7 rewrites function expressions to arrows by default, which
    // would emit ES6 into a bundle whose source is ES5 and whose vendored
    // Bootstrap 4 / jQuery 3 still target IE11. Keep the output ES5.
    .pipe(uglify({
      compress: {
        arrows: false
      }
    }))
    .pipe(header(banner, {
      pkg: pkg
    }))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('./js'))
    .pipe(browsersync.stream());
}

// Watch files
function watchFiles() {
  gulp.watch("./scss/**/*", css);
  gulp.watch(["./js/**/*", "!./js/**/*.min.js"], js);
  gulp.watch("./**/*.html", browserSyncReload);
}

// Define complex tasks
const vendor = gulp.series(clean, modules);
const build = gulp.series(vendor, gulp.parallel(css, js));
const watch = gulp.series(build, gulp.parallel(watchFiles, browserSync));

// Export tasks
exports.css = css;
exports.js = js;
exports.clean = clean;
exports.vendor = vendor;
exports.build = build;
exports.watch = watch;
exports.default = build;
