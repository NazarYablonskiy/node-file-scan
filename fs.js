var fs = require('fs');
var async = require('async');
var filesStorage = [];

var getFileInfo = function(filename) {
    var stats = fs.statSync(filename);
    if (stats.isDirectory()) {
        readDir(filename);
    } else if (stats.isFile() && !!stats.size) {
        filesStorage.push({
            "name": filename,
            "size": stats.size
        });
    }
}

var readDir = function(path) {
    var files = fs.readdirSync(path);
    files.forEach(function(file) {
        getFileInfo(path + '/' + file);
    });
}

var main = function() {
    var path = __dirname + '/files';
    // var path = '/home/nazar/Desktop/';
    readDir(path);
}

main();

console.log(filesStorage);