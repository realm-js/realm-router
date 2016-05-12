var gulp = require("gulp");
var babel = require("gulp-babel");
var runSequence = require('run-sequence');
var _ = require('lodash')
var realm = require('realm-js');
var spawn = require('child_process').spawn;
var node;

gulp.task('server', function() {
   if (node) node.kill()
   node = spawn('node', ['app.js'], {
      stdio: 'inherit'
   })
   node.on('close', function(code) {
      if (code === 8) {
         gulp.log('Error detected, waiting for changes...');
      }
   });
});

gulp.task('start', ['run'], function() {
   return gulp.watch(['src/**/*.js'], function() {
      runSequence('build', 'server')
   });
});

gulp.task('run', function(cb) {
   runSequence('build', 'server', cb);
});

gulp.task("build", function() {
   return gulp.src("src/**/*.js").pipe(realm.transpiler({
         preffix: "realm",
         base: "src",
         target: "./index.js"
      }))
      .pipe(babel({
         presets: ["es2016"],
         plugins: ["transform-decorators-legacy"]
      }))
      .on('error', function(e) {
         console.log(e.stack);
         this.emit('end');
      })
      .pipe(realm.transpiler({
         wrap: true
      }))
      .pipe(gulp.dest("./"));
});
