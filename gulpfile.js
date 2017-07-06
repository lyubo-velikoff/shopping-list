/* jshint -W097 */
/* globals require, console, process */
"use strict";

/* ============================================ *
 *              Import dependencies
 * ============================================ */


var gulp = require('gulp'),
    concat = require('gulp-concat'),
    concatCSS = require('gulp-concat-css'),
    imagemin = require('gulp-imagemin'),
    cleanCSS = require('gulp-clean-css'),
    sass = require('gulp-sass'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    maps = require('gulp-sourcemaps'),
    notify = require('gulp-notify'),  // unused
    gutil = require('gulp-util'),
    prettyError = require('gulp-prettyerror'),
    connect = require('gulp-connect-php'),
    ftp = require('vinyl-ftp'),
    browserSync = require('browser-sync'),
    runSequence = require('run-sequence'),
    ngrok = require('ngrok'),
    psi = require('psi'),
    qunit = require('gulp-qunit'),
    shell = require('gulp-shell'),
    del = require('del');

var config = require('./config.js');

var reload = browserSync.reload;

/* ============================================ *
 *               Define Tasks
 * ============================================ */


/* ============ Optimize Images =============== */


gulp.task('minifyImages', function() {
    gulp.src(config.imagesFolder)
    .pipe(imagemin())
    .pipe(gulp.dest(config.imagesOutputFolder));
});


/* ============ Optimize Scripts =============== */


gulp.task('concatScripts', function() {
    return gulp.src(config.scripts.concatScriptsFiles)
    .pipe(prettyError())
    .pipe(maps.init())
    .pipe(concat(config.scripts.scriptConcatOutputFile))
    .pipe(maps.write('./'))
    .pipe(gulp.dest(config.scriptsFolder));
});

gulp.task('minifyScripts', ['concatScripts'], function() {
    return gulp.src(config.scripts.scriptMinifyFile)
    .pipe(prettyError())
    .pipe(uglify())
    .pipe(rename(config.scripts.scriptMinifyOutputFile))
    .pipe(gulp.dest(config.scriptsFolder));
});


/* ============ Optimize Css =============== */

gulp.task('compileSass', function() {
    return gulp.src(config.styles.sassFiles)
    .pipe(maps.init())
    .pipe(prettyError())
    .pipe(sass().on('error', sass.logError))
    .pipe(maps.write('./'))
    .pipe(gulp.dest(config.cssFolder));
});

gulp.task('concatCss', ['compileSass'], function() {
    return gulp.src(config.styles.cssConcatFiles)
    .pipe(prettyError())
    .pipe(concatCSS(config.styles.concatOutputFile))
    .pipe(gulp.dest(config.cssFolder));
});

gulp.task('minifyCss', ['concatCss'], function() {
    return gulp.src(config.cssFolder + '/' + config.styles.concatOutputFile)
    .pipe(prettyError())
    .pipe(cleanCSS(config.styles.minifyCssOptions))
    .pipe(rename(config.styles.cssMinifyOutputFile))
    .pipe(gulp.dest(config.cssFolder));
});


/* ============ Serve Files =============== */


gulp.task('serve', ['minifyScripts', 'minifyCss'], function() {
    browserSync({
        proxy: config.browserSyncLocation,
        port: config.globalPort,
        snippetOptions: {
            // this option deals with php errors(prevents browserSync from stop working)
            rule: {
                match: /$/
            }
        },
        notify: false
    });

    gulp.watch(['app/**/*.php'], reload);
    gulp.watch(['app/assets/scss/**/*.scss'], ['minifyCss', reload]);
    gulp.watch(['app/assets/js/**/script.js'], ['minifyScripts', reload]);
    gulp.watch(['app/assets/images/**/*'], reload);
});


/* ============ Copy Files To Build Folder =============== */



gulp.task('copy', function() {
    console.log(config.scriptsFolder + '/' + config.scripts.scriptMinifyOutputFile);
    return gulp.src([
        'app/*',
        'app/.htaccess',
        config.cssFolder + '/' + config.styles.cssMinifyOutputFile,
        config.scriptsFolder + '/' + config.scripts.scriptMinifyOutputFile,
        config.imagesFolder,
        config.includesFolder,
        config.fontsFolder,
    ], { base: './app' })
    .pipe(gulp.dest(config.buildFolder));
});



/* ============ Clean Build Folder And Minified Scripts and Styles =============== */


gulp.task('clean', ['cleanTests'], function() {
    del([
        'dist',
        config.scriptsFolder + '/' + config.scripts.scriptConcatOutputFile,
        config.scriptsFolder + '/' + config.scripts.scriptMinifyOutputFile,
        config.cssFolder + '/' + config.styles.cssMinifyOutputFile,
        config.cssFolder + '/' + config.styles.concatOutputFile,
        config.cssFolder + '/grid.css',
        config.cssFolder + '/style.css',
        'app/assets/**/*.map'
    ]);
});


/* ============ Run Automated Tests ============ */


gulp.task('cleanTests', function() {
    del([
        config.testsFolder + '/*.*',
        config.qunitFolder + '/app/**/*',
        config.qunitFolder + '/lib/**/*',
        'qunit-coverage.xml'
    ]);
});

gulp.task('copyAppToTest', function() {
    return gulp.src(config.scriptsFolder + '/**/*')
    .pipe(gulp.dest(config.qunitFolder + '/app/assets/js'));
});

gulp.task('copyQunitSupportFiles', function() {
    return gulp.src([
        'node_modules/qunitjs/qunit/qunit.css',
        'node_modules/qunitjs/qunit/qunit.js',
        'node_modules/qunit-reporter-junit/qunit-reporter-junit.js',
        'node_modules/qunit-reporter-lcov/qunit-reporter-lcov.js',
        'node_modules/blanket/dist/qunit/blanket.min.js'
    ])
    .pipe(gulp.dest(config.qunitFolder + '/lib'));
});

gulp.task('testQunit', ['copyAppToTest', 'copyQunitSupportFiles'], function() {
    return gulp.src(config.qunitFolder + '/runner.html')
    .pipe(qunit({
        runner: config.qunitFolder + '/runner-json.js'
    }));
});

gulp.task('testQunitCoverage', ['testQunit'], shell.task([
    'python -m lcov_cobertura ' + config.testsFolder + '/qunit.lcov -o qunit-coverage.xml'
]));

gulp.task('test', ['testQunitCoverage'], function() {
    return null; // is this right?
});

/* ============ Build Project =============== */



gulp.task('default', ['clean'], function(cb) {
    runSequence(
        'minifyCss',
        'minifyScripts',
        ['minifyImages', 'copy'],
        cb
    );
});



/* ============================================ *
 *             Page Speed Insighs
 * ============================================ */

var site = '';

gulp.task('php-server', function() {
    return connect.server({
        bin: '', // php exe file
        ini: '', // php ini file
        port: 8086, // port for the server
        base: '' // root folder for the server e.g. workflow/app/
    });
});


gulp.task('ngrok-url', function(cb) {
    return ngrok.connect({
        proto: 'http',
        addr: '8086', // this should be the port of the gulp php server (above)
        region: 'eu'
    }, function(err, url) {
        site = url;
        console.log('serving your tunnel from: ' + site);
        cb();
    });
});


gulp.task('psi-mobile', function() {
    return psi.output(site, {strategy: 'mobile', locale: 'en_GB', threshold: 60}).then(function() {
        console.log('Finished Mobile');
    });
});

gulp.task('psi-desktop', function() {
    return psi.output(site,  {strategy: 'desktop', locale: 'en_GB', threshold: 60}).then(function() {
        console.log('Finished Desktop');
    });
});


gulp.task('browser-sync-psi', function() {
    browserSync({
        proxy: config.browserSyncLocation,
        port: config.globalPort,
        open: false,
        notify: false
    });
});

gulp.task('kill-process', function() {
    process.exit();
});

gulp.task('psi-seq', function(cb) {
    return runSequence(
        'minifyCss',
        'minifyScripts',
        'minifyImages',
        'php-server',
        'ngrok-url',
        'psi-desktop',
        'psi-mobile',
        'kill-process',
        cb
    );
});

gulp.task('psi', ['psi-seq'], function() {
    console.log('Woohoo! Check out your page speed scores!');
});


/* ============================================ *
 *              Deploy
 * ============================================ */

/* FTP settings */
var user = process.env.USER;
var password = process.env.PASSWORD;
var host = process.env.HOST;

var port = 21;
var localFilesGlob = 'dist/**/*.*';
var remoteFolder = '/';

// helper function to build an FTP connection based on our configuration
function getFtpConnection() {
    return ftp.create({
        host: host,
        port: port,
        user: user,
        password: password,
        parallel: 5,
        log: gutil.log
    });
}

/**
 * Deploy task.
 * Copies the new files to the server
 *
 * Usage: `FTP_USER=someuser FTP_PWD=somepwd gulp ftp-deploy`
 */
gulp.task('deploy', ['default'], function() {
    var conn = getFtpConnection();
    return gulp.src([localFilesGlob], { base: './dist', buffer: false })
    .pipe(conn.newer(remoteFolder)) // only upload newer files
    .pipe(conn.dest(remoteFolder));
});



/**
 * Watch deploy task.
 * Watches the local copy for changes and copies the new files to the server whenever an update is detected
 *
 * Usage: `FTP_USER=someuser FTP_PWD=somepwd gulp ftp-deploy-watch`
 */
gulp.task('ftp-deploy-watch', function() {
    var conn = getFtpConnection();

    gulp.watch([localFilesGlob])
    .on('change', function(event) {
      console.log('Changes detected! Uploading file "' + event.path + '", ' + event.type);

      return gulp.src( [event.path], { base: '.', buffer: false } )
        .pipe( conn.newer( remoteFolder ) ) // only upload newer files
        .pipe( conn.dest( remoteFolder ) )
      ;
    });
});
