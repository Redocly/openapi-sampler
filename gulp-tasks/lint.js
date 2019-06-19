import gulp  from 'gulp';

function onError() {
  console.log('Failed');
}

// Lint a set of files
function lint(files) {
  const $ = global.$;

  return gulp.src(files)
    .pipe($.plumber())
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.eslint.failOnError())
    .on('error', onError);
}

function lintSrc() {
  return lint('src/**/*!(spec).js');
}

function lintTest() {
  return lint(['test/**/*.spec.js', 'src/**/*.spec.js']);
}

function lintGulpfile() {
  return lint('gulpfile.babel.js');
}

// Lint our source code
gulp.task('lint-src', lintSrc);

// Lint our test code
gulp.task('lint-test', lintTest);

// Lint this file
gulp.task('lint-gulpfile', lintGulpfile);

// Lint everything
gulp.task('lint', gulp.parallel('lint-src', 'lint-test', 'lint-gulpfile'));
