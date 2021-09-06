"use strict";

var utils = require("./utilities");

var fs = require('fs');
var path = require('path');

function copyFileSync( source, target ) {

    var targetFile = target;

    if ( fs.existsSync( target ) ) {
        if ( fs.lstatSync( target ).isDirectory() ) {
            targetFile = path.join( target, path.basename( source ) );
        }
    }
    process.stdout.write('Copying ' + source + ' to ' + targetFile);
    fs.writeFileSync(targetFile, fs.readFileSync(source));
}

module.exports = function(context) {
	var cordovaAbove8 = utils.isCordovaAbove(context, 8);
	var cordovaAbove7 = utils.isCordovaAbove(context, 7);
	var defer;
	if (cordovaAbove8) {
		defer = require("q").defer();
	} else {
		defer = context.requireCordovaModule("q").defer();
	}
	
	if (context.opts.projectRoot) {
		
		copyFileSync( path.join(context.opts.projectRoot,'www/voice-config/actions.xml'), path.join(context.opts.projectRoot, '/platforms/android/app/src/main/res/xml') );
		
		var fileQueries = '';
		
		fs.readFile( path.join(context.opts.projectRoot,'www/voice-config/string-queries.xml') , "utf-8", function(err,data ) {
			if (err) console.log(err);
			fileQueries = data + '</resources>';
		});
	
		fs.readFile( path.join(context.opts.projectRoot, '/platforms/android/app/src/main/res/values/strings.xml') , "utf-8", function(err,data ) {
			if (err) console.log(err);
			var result = data.replace(/<\/resources>/g, fileQueries);
			fs.writeFile(path.join(context.opts.projectRoot, '/platforms/android/app/src/main/res/values/strings.xml'), result, 'utf8', function (err) {
				if (err) return console.log(err);
			});
		});
	}
	
	return defer.promise;
}

