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

gulp.task('cssMinify', () => {
  gulp.src('src/css/*')
    .pipe(cssMinify())
    .pipe(gulp.dest('dist/css'));
});

gulp.task('jsMinify', () => {
  gulp.src('src/js/*')
    .pipe(jsMinify())
    .pipe(gulp.dest('dist/js'));
});

gulp.task('serve', serve('dist'));

gulp.task('default', ['htmlMinify', 'cssMinify', 'jsMinify', 'serve']);