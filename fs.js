var fs = require('fs');
var fileStorage = [];
var BUFFER_SIZE = 1024;

var getFileInfo = function(filename) {
    var file;
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
        getFileInfo(path + '/' + file)
    });
}

var sortBySize = function(files) {
    files.sort(function(a, b) {
        return a.size - b.size;
    });
    return files;
}

var sortByData = function(files) { //odn`t working right
    files.sort(function(a, b) {
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
        if (files[0].size < BUFFER_SIZE) {
            comparedFiles[comparedFiles.length] = compareFiles(files, readFiles, compareFilesFunc);
        } else {
            comparedFiles[comparedFiles.length] = compareFiles(files, readBigFiles, compareBigFilesFunc);
        }
    });
    return comparedFiles;
}

var compareFiles = function(files, readFunc, compareFunc) {
    var readedFiles = readFunc(files);
    var comparedFiles = compareByBuffers(readedFiles, compareFunc);
    var filenames = getNames(comparedFiles);
    return filenames;
}

var readFiles = function(files) {
    for (var file in files) {
        files[file].buffer = fs.readFileSync(files[file].name).toString();
    };
    return files;
}

var readBigFiles = function(files) {
    return files;
}

var compareFilesFunc = function(file_1, file_2) {
    return file_1.buffer == file_2.buffer;
}

var compareBigFilesFunc = function(file_1, file_2) {
    var result = false;
    try {
        var stream1 = fs.openSync(file_1.name, 'r');
        var stream2 = fs.openSync(file_2.name, 'r');
        var pos;
        for (pos = 0; pos + BUFFER_SIZE < file_1.size; pos += BUFFER_SIZE) {
            if (compareBigFilesIteration(stream1, stream2, pos)) {
                result = true;
            } else {
                result = false;
                break;
            }
        }
        if(result) result = compareBigFilesIteration(stream1, stream2, file_1.size - BUFFER_SIZE);
    } catch (err) {

    }

    //read buffers from stream and compare it for equality in loop
    return result;
}

var compareBigFilesIteration = function(stream1, stream2, pos) {
    var result = false;
    var buffer1 = new Buffer(BUFFER_SIZE);
    var buffer2 = new Buffer(BUFFER_SIZE);
    fs.readSync(stream1, buffer1, 0, BUFFER_SIZE, pos);
    fs.readSync(stream2, buffer2, 0, BUFFER_SIZE, pos);
    if (buffer1.toString() === buffer2.toString()) {
        result = true;
    } else {
        result = false;
    }
    return result;
}

var compareByBuffers = function(files, compareFunc) {
    files.push({
        buffer: 0
    })
    sortByData(files);
    files.filter(function() {
        return true;
    });
    var comparedFiles = [];
    var buff;
    for (var i = 0; i < files.length; i++) {
        if (!files[i]) continue;
        buff = [];
        buff[0] = files[i];
        files[i] = undefined;
        for (var j = 0; j < files.length; j++) {
            if (!files[j]) continue;
            if (compareFunc(buff[0], files[j])) {
                buff.push(files[j]);
                files[j] = undefined;
            }
        }
        if (buff.length > 1) {
            comparedFiles.push(buff);
        }
    }
    return comparedFiles;
}

var getNames = function(filesArrs) { //gets 2x array
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
    var path = process.argv[2] || __dirname + '/files';
    readDir(path);
    fileStorage = sortBySize(fileStorage);
    fileStorage = groupBySize(fileStorage);
    fileStorage = checkFileGroups(fileStorage);
    console.log(fileStorage);
}();