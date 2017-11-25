var gulp = require('gulp'),
  htmlMinify = require('gulp-htmlmin'),
  cssMinify = require('gulp-clean-css'),
  jsMinify = require('gulp-jsmin'),
  serve = require('gulp-serve');

gulp.task('htmlMinify', () => {
  gulp.src('src/*.html')
    .pipe(htmlMinify({collapseWhitespace: true}))
    .pipe(gulp.dest('dist'));
});

gulp.task('imageCopy', () => {
  gulp.src('src/images/*')
    .pipe(gulp.dest('dist/images'));
});

gulp.task('cssMinify', () => {
  gulp.src('src/css/*')
    .pipe(cssMinify())
    .pipe(gulp.dest('dist/css'));
});

gulp.task('jsMinify', () => {
  gulp.src('src/js/*.js')
    .pipe(jsMinify())
    .pipe(gulp.dest('dist/js'));
  gulp.src('src/js/config/*.js')
    .pipe(jsMinify())
    .pipe(gulp.dest('dist/js/config'));
  gulp.src('src/js/models/*.js')
    .pipe(jsMinify())
    .pipe(gulp.dest('dist/js/models'));
  gulp.src('src/js/viewmodels/*.js')
    .pipe(jsMinify())
    .pipe(gulp.dest('dist/js/viewmodels'));
});

gulp.task('serve', serve('dist'));

gulp.task('default', ['htmlMinify', 'imageCopy', 'cssMinify', 'jsMinify', 'serve']);
