var gulp = require('gulp'),
    gulpWatch = require('gulp-watch'),
    del = require('del'),
    runSequence = require('run-sequence'),
    argv = process.argv;


/**
 * Ionic hooks
 * Add ':before' or ':after' to any Ionic project command name to run the specified
 * tasks before or after the command.
 */
gulp.task('serve:before', ['watch']);
gulp.task('emulate:before', ['build']);
gulp.task('deploy:before', ['build']);
gulp.task('build:before', ['build']);

// we want to 'watch' when livereloading
var shouldWatch = argv.indexOf('-l') > -1 || argv.indexOf('--livereload') > -1;
gulp.task('run:before', [shouldWatch ? 'watch' : 'build']);

/**
 * Ionic Gulp tasks, for more information on each see
 * https://github.com/driftyco/ionic-gulp-tasks
 *
 * Using these will allow you to stay up to date if the default Ionic 2 build
 * changes, but you are of course welcome (and encouraged) to customize your
 * build however you see fit.
 */
var buildBrowserify = require('ionic-gulp-browserify-typescript');
var buildSass = require('ionic-gulp-sass-build');
var copyHTML = require('ionic-gulp-html-copy');
var copyFonts = require('ionic-gulp-fonts-copy');
var copyScripts = require('ionic-gulp-scripts-copy');
var tslint = require('ionic-gulp-tslint');

var isRelease = argv.indexOf('--release') > -1;


var typescript = require('gulp-typescript');
gulp.task('compile-server', function() {
  gulp.src(['server/**/*.ts'])
    .pipe(typescript())
    .pipe(gulp.dest('server/'))
});

var nodemon = require('gulp-nodemon');
var runSequence = require('run-sequence');

gulp.task('server', function(callback) {
  runSequence('compile-server', 'run-server', callback);
});

// Start a node server
gulp.task('run-server', function() {
  nodemon({
    script: 'server/server.js',
    ext: 'ts',
    env: {'NODE_ENV': 'development'},
    tasks: ['compile-server']
  });
});

// Allow for killing the server process
process.on('SIGINT', function() {
  setTimeout(function() {
    gutil.log(gutil.colors.red('Successfully closed ' + process.pid));
    process.exit(1);
  }, 500);
});

gulp.task('watch', ['clean'], function(done){
  runSequence(
    ['sass', 'html', 'fonts', 'scripts', 'configFile'],
    function(){
      gulpWatch('app/**/*.scss', function(){ gulp.start('sass'); });
      gulpWatch('app/**/*.html', function(){ gulp.start('html'); });
      buildBrowserify({ watch: true }).on('end', done);
    }
  );
});

gulp.task('build', ['clean'], function(done){
  runSequence(
    ['sass', 'html', 'fonts', 'scripts', 'configFile'],
    function(){
      buildBrowserify({
        minify: isRelease,
        browserifyOptions: {
          debug: !isRelease
        },
        uglifyOptions: {
          mangle: false
        }
      }).on('end', done);
    }
  );
});

var fs = require('fs');

// Copy the config file so it can be picked up by the ConfigHolder
gulp.task('configFile', function(cb) {
  var nconf = require('nconf');
  nconf.argv().env();
  var environment = nconf.get('NODE_ENV') || 'development';
  nconf.file(environment, './config/' + environment.toLowerCase() + '.json');
  nconf.file('default', './config/default.json');
  var client = {"client": nconf.get('client') };
  var clientContents = JSON.stringify(client);
  fs.writeFile('generated/config.json', clientContents, function(err) {
    if(err) throw err;
    gulp.src('generated/config.json');
    cb();
  });
});

gulp.task('sass', buildSass);
gulp.task('html', copyHTML);
gulp.task('fonts', copyFonts);
gulp.task('scripts', copyScripts);
gulp.task('clean', function(){
  return del('www/build');
});
gulp.task('lint', tslint);

gulp.task('default', ['build']);

