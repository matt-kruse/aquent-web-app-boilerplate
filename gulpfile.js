/**
 * Aquent Web App Boilerplate
 * Matt Kruse
 * 
 * This is an attempt at a "web app" boilerplate gulp build process.
 * It may very well be terrible.
 *
 * Features:
 *  - LESS support
 *    - By default, combine *.css and *.less into style.css in dist/
 *  - Ignore all files beginning with "_" when building
 *  - Build options controlled by build-options.json
 *  - Substitution of variables in *.html during build process
 *    - Syntax by default is #{#variablename#}#
 *    - Start/end tags can be configured in build-options.json
 *    - Replace value comes from template-data.json
 *  
 * Tasks:
 *
 * gulp
 *  - Full build to dist/
 * gulp dev
 *  - Watch for changes to *.(css|less|html|js) and re-run tasks
 * gulp clean
 * gulp less-compile
 * gulp style-concat
 * gulp css2js
 * gulp html
 * gulp js
 *
 */
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
$.runSequence = require('run-sequence');

// Load configuration values
var template_data = require('./template-data.json');
var options = require('./build-options.json');

/* UTIL Functions */
/* ============== */

// Used to consume errors generated inside watch(), so the watch doesn't die
// .on('error',swallowError)
function swallowError (error) {
    console.log(error.toString());
    this.emit('end');
}

// Get an object property from a string property description
function getProperty(o, s) {
    s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
    s = s.replace(/^\./, '');           // strip a leading dot
    var a = s.split('.');
    while (a.length) {
        var n = a.shift();
        if (n in o) {
            o = o[n];
        } else {
            return;
        }
    }
    return o;
}

/* Default Task */
/* ============ */

gulp.task('default', function() {
	// Default task is a production build
	$.runSequence( 
		'clean',
		options.concat_style?'style-concat':'less-compile',
		'html',
		'js',
		'images',
		'fonts',
		'copy-misc-files'
	);
});

/* Housekeeping Tasks */
/* ================== */

gulp.task('clean', function() {
	return gulp.src(options.paths.dist+'*', {read:false})
		.pipe($.rimraf({force:true}))
});

/* Build Tasks */
/* =========== */

// Copy misc files that may be part of the app which other tasks do not handle
gulp.task('copy-misc-files', function() {
	return gulp.src( [
			options.paths.all,
			"!"+options.paths.ignore,
			"!"+options.paths.less,
			"!"+options.paths.css,
			"!"+options.paths.html,
			"!"+options.paths.js,
			"!"+options.paths.image,
			"!"+options.paths.fonts
		])
		.pipe(gulp.dest(options.paths.dist))
		.pipe($.if(options.verbose, $.size({title: 'copy-misc-files'}) ))
});

/* Development Tasks */
/* ================= */

gulp.task('dev', /* ['default'], */ function() {
	$.watch([options.paths.less,options.paths.css], [ options.concat_style?'style-concat':'less-compile' ]);
	$.watch(options.paths.html, ['html'] );
	$.watch(options.paths.js, ['js'] );
});

/* CSS Tasks */
/* ========= */

gulp.task('less-compile', function() {
	return gulp.src(options.paths.less,"!"+options.paths.ignore)
		.pipe($.less()).on('error',swallowError)
		.pipe($.autoprefixer({browsers: options.AUTOPREFIXER_BROWSERS}))
		.pipe($.extReplace('.css'))
		.pipe(gulp.dest(options.paths.dist))
		.pipe($.if(options.verbose, $.size({title: 'less-compile'}) ))
});

gulp.task('style-concat', function() {
	return gulp.src( [options.paths.less,options.paths.css,"!"+options.paths.ignore] )
		.pipe($.less()).on('error',swallowError)
		.pipe($.concat(options.combined_css_file))
		.pipe($.autoprefixer({browsers: options.AUTOPREFIXER_BROWSERS}))
		.pipe(gulp.dest(options.paths.dist))
		.pipe($.if(options.verbose, $.size({title: 'style-concat'}) ))
});

gulp.task('css2js', function() {
	return gulp.src(options.paths.css,"!"+options.paths.ignore)
		.pipe($.css2js())
		.pipe($.extReplace('.js'))
		.pipe(gulp.dest(options.paths.dist))
		.pipe($.if(options.verbose, $.size({title: 'css2js'}) ))
});

/* JS Tasks */
/* ======== */

gulp.task('js', function() {
	return gulp.src(options.paths.js)
		.pipe($.jshint()).on('error',swallowError)
		.pipe($.jshint.reporter('default'))
		.pipe(gulp.dest(options.paths.dist))
		.pipe($.if(options.verbose, $.size({title: 'js'}) ))
});

/* HTML Tasks */
/* ========== */

gulp.task('html', function() {
	return gulp.src(options.paths.html)
		.pipe($.replace(new RegExp(options.config_variable_open+'(.+?)'+options.config_variable_close, "g"), function(str,match) {
			var replaced = getProperty(template_data,match);
			if (typeof replaced=="undefined") { replaced=""; }
			if (options.verbose) { 
				console.log("Replacing ["+match+"] with ["+replaced+"]"); 
			}
			return replaced;
		}))
		.pipe(gulp.dest(options.paths.dist))
		.pipe($.if(options.verbose, $.size({title: 'html'}) ))
});

/* FONT Tasks */
/* ========== */
gulp.task('fonts', function() {

});

/* IMAGE Tasks */
/* =========== */
gulp.task('images', function() {

});





