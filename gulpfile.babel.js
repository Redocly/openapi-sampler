import gulp  from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import './gulp-tasks';
// Load all of our Gulp plugins
global.$ = gulpLoadPlugins();

gulp.task('default', gulp.series('test'));
