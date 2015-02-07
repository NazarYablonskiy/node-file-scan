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
    fileStorage.push({
        size: 0
    }); //страховка =)
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

var checkFileGroups = function() {
    var comparedFiles = [];
    fileStorage.forEach(function(files) { //file is big if file size > 1024 Bytes
        if (files[0].size <= 1024) {
            comparedFiles[comparedFiles.length] = compareFiles(files);
        } else {
            // comparedFiles[comparedFiles.length] = compareBigFiles(files) || undefined;
        }
    });
    fileStorage = comparedFiles;
}

var compareFiles = function(files) {
    var readedFiles = readFiles(files);
    var comparedFiles = compareByBuffers(readedFiles);
    var filenames = getNames(comparedFiles);
    return filenames;
}

// var compareBigFiles = function(files) {

// }

// var readBigFiles = function(files) {
//     var readedFiles = [];
//     files.forEach(function(file) {
//         readedFiles.push(readFilePart(file.name));
//     });
//     return readedFiles;
// }

// var readFilePart = function(filename) {
//     //return part of filename;
//     return true;
// }

var readFiles = function(files) {
    for (var file in files) {
        files[file].buffer = fs.readFileSync(files[file].name);
    };
    return files;
}

var compareByBuffers = function(files) {
	files.push({buffer: 0})
    var comparedFiles = [];
    var buff = [];
    files.forEach(function(file) {
        if (buff.length == 0) {
            buff.push(file);
        } else if (buff[buff.length - 1].buffer.toString() == file.buffer.toString()) {
            buff.push(file);
        } else if (buff.length >= 2) {
            comparedFiles.push(buff);
            buff = [];
            buff.push(file);
        } else {
            buff = [];
            buff.push(file);
        }
    });
    return comparedFiles;
}
 
var getNames = function(filesArrs) {  //gets 2x array
    var filenames = [];
    filesArrs.forEach(function(files) {
    	var buff = [];
    	for (var file in files) {
        	buff.push(files[file].name);
    	}
    	filenames.push(buff);
    });
    return filenames;
}

var main = function() { // runing	
    var path = __dirname + '/files';
    // var path = '/home/nazar/Apps';
    readDir(path);
    sortBySize();
    groupBySize();
    checkFileGroups();
    console.log(fileStorage);
}();