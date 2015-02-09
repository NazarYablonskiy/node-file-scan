var fs = require('fs');
var fileStorage = [];

var getFileInfo = function(filename) {
	var file;
    try {
        var stats = fs.statSync(filename);
        if (stats.isDirectory()) {
            readDir(filename);
        } else if (stats.isFile() && !!stats.size) {
            file = {
                "name": filename,
                "size": stats.size
            };
        }
    } catch (err) {
        //ignor all fs errs
    }
    return file;
}

var readDir = function(path) {
    var files = fs.readdirSync(path);
    files.forEach(function(file) {
        file = getFileInfo(path + '/' + file);
    });
    return files;
    console.log(files);
}

var sortBySize = function(files) {
    files.sort(function(a, b) {
        return a.size - b.size;
    });
    return files;
}

var sortByData = function(files) { //odn`t working right
	files.sort(function(a, b){
		return a.buffer - b.buffer;
	});
}

var groupBySize = function(files) {
    files.push({
        size: 0
    }); //страховка =)
    var groupedFiles = [];
    var buff = [];
    files.forEach(function(file) {
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
    return groupedFiles;
}

var checkFileGroups = function(filesArr) {
    var comparedFiles = [];
    filesArr.forEach(function(files) { //file is big if file size > 1024 Bytes
        if (files[0].size <= 10240) {
            comparedFiles[comparedFiles.length] = compareFiles(files);
        } else {
            // comparedFiles[comparedFiles.length] = compareBigFiles(files) || undefined;
        }
    });
    return comparedFiles;
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

var compareFiles = function(files) {
    var readedFiles = readFiles(files);
    var comparedFiles = compareByBuffers(readedFiles);
    var filenames = getNames(comparedFiles);
    return filenames;
}

var readFiles = function(files) {
    for (var file in files) {
        files[file].buffer = fs.readFileSync(files[file].name).toString();
    };
    return files;
}

var compareByBuffers = function(files) {
	files.push({buffer: 0})
	sortByData(files);
    var comparedFiles = [];
    var buff = [];
    files.forEach(function(file) {
        if (buff.length == 0) {
            buff.push(file);
        } else if (buff[buff.length - 1].buffer == file.buffer) {
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

var main = function() { 	
    var path = __dirname + '/files';
    // var path = '/home/nazar';
    readDir(path);
    fileStorage = sortBySize(fileStorage);
    fileStorage = groupBySize(fileStorage);
    fileStorage = checkFileGroups(fileStorage);
    console.log(fileStorage);
}();