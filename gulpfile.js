var gulp = require("gulp");
var babel = require("gulp-babel");
var runSequence = require('run-sequence');
var _ = require('lodash')
var realm = require('realm-js');
var spawn = require('child_process').spawn;
var uglify = require('gulp-uglify');
var rename = require("gulp-rename");
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

gulp.task('start', function() {
   return runSequence('build-universal', 'babel', function() {
      runSequence('server')
      return gulp.watch(['src/**/*.js'], function() {
         runSequence('build-universal', 'babel', 'server')
      });
   });
});

gulp.task("build-universal", function() {
   return realm.transpiler2.universal("src/", "build/")
});

gulp.task("babel", function() {
   return gulp.src("build/**/*.js")
      .pipe(babel({
         presets: ["es2016"],
         plugins: ["transform-decorators-legacy"]
      }))
      .on('error', function(e) {
         console.log(e.stack);
         this.emit('end');
      })
      .pipe(gulp.dest("./build"));
});

gulp.task("build", function() {
   return runSequence('build-universal', 'babel')
});

gulp.task('uglify', function() {
   return gulp.src("build/frontend.js").pipe(uglify())
      .pipe(rename("frontend.min.js"))
      .pipe(gulp.dest('build/'));
})
gulp.task("dist", function() {
   return runSequence('build-universal', 'babel', 'uglify')
});
