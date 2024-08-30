import gulp from "gulp";

import { coverage } from "./coverage";
import mochaGlobals from "../test/setup/.globals.json";

export function mocha() {
  const $ = global.$;

  require("@babel/register");
  return gulp
    .src(["test/setup/node.js", "test/**/*.spec.js", "src/**/*.spec.js"], {
      read: false,
    })
    .pipe(
      $.mocha({
        reporter: "spec",
        globals: Object.keys(mochaGlobals.globals),
        ignoreLeaks: false,
      })
    );
}

function test(done) {
  coverage(done);
}

// Lint and run our tests
gulp.task("test", gulp.series("lint", test));
