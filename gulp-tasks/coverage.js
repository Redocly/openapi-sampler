import gulp  from 'gulp';

import { mocha } from './test';

export function coverage(done) {
  const $ = global.$;

  require('@babel/register');
  gulp.src(['src/**/!(*spec).js'])
    .pipe($.istanbul.hookRequire())
    .on('finish', () => {
      return mocha()
        .pipe($.istanbul.writeReports({
          dir: './coverage/lcov'
        }))
        .on('end', done);
    });
}

gulp.task('coverage', gulp.series('lint', coverage));
