var fs = require('fs');
var fileStorage = [];

var getFileInfo = function(filename) {
    try {
        var stats = fs.statSync(filename);
        if (stats.isDirectory()) {
            readDir(filename);
        } else if (stats.isFile() && !!stats.size) {
            fileStorage.push({
                "name": filename,
                "size": stats.size
            });
        }
    } catch (err) {
        //ignor all fs errs
    }
}

var readDir = function(path) {
    var files = fs.readdirSync(path);
    files.forEach(function(file) {
        getFileInfo(path + '/' + file);
    });
}

var sortBySize = function() {
    fileStorage.sort(function(a, b) {
        return a.size - b.size;
    });
}

var groupBySize = function() {
	fileStorage.push({size: 0}); //страхвка =)
    var groupedFiles = [];
    var buff = [];
    fileStorage.forEach(function(file) {
        if (buff.length == 0) {
            buff.push(file);
        } else if (buff[buff.length - 1].size == file.size) {
            buff.push(file);
        } else if (buff.length >= 2) {
            groupedFiles.push(buff);
            buff = [];
            buff.push(file);
        } else {
            buff = [];
            buff.push(file);
        }
    });
    fileStorage = groupedFiles;
}

var main = function() {
    var path = __dirname + '/files';
    // var path = '/home/nazar/Apps';
    readDir(path);
    sortBySize();
    groupBySize();
    console.log(fileStorage);
}(); // run