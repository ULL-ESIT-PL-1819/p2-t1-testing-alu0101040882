var gulp = require('gulp');
var shell = require('gulp-shell');

gulp.task("c5-get-guttenberg", shell.task(

	'npm test &&' +
	'node rdf-to-json.js test/pg132.rdf' 
));
