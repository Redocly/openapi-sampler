import gulp  from 'gulp';
import {Server as KarmaServer} from 'karma';

import {coverage} from './coverage';
import mochaGlobals from '../test/setup/.globals.json';

export function mocha() {
  const $ = global.$;

  require('@babel/register');
  return gulp.src(['test/setup/node.js', 'test/**/*.spec.js', 'src/**/*.spec.js'], {read: false})
    .pipe($.mocha({
      reporter: 'spec',
      globals: Object.keys(mochaGlobals.globals),
      ignoreLeaks: false
    }));
}

function karma(done) {
  new KarmaServer({
    configFile: __dirname + '/../karma.conf.js',
    singleRun: true
  }, done).start();
};

function test(done) {
  if (process.env.KARMA) {
    karma(done);
  } else {
    coverage(done);
  }
}

// Lint and run our tests
gulp.task('test', gulp.series('lint', test));
gulp.task('test-browser', gulp.series('lint', karma));
