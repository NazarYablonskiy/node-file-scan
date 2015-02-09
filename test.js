var fs = require('fs');
var f1 = '/home/nazar/jss/node/files/imgres.png';
var f2 = '/home/nazar/jss/node/files/subfolder/imgres.png';
var f3 = '/home/nazar/jss/node/files/subfolder/img.png';

var file1 = fs.openSync(f1, 'r');
var file2 = fs.openSync(f2, 'r');
var file3 = fs.openSync(f3, 'r');
console.log(file1);

var buffer1 = new Buffer(100);
var buffer2 = new Buffer(100);
var buffer3 = new Buffer(100);

fs.readSync(file1, buffer1, 0, 100, 0);
fs.readSync(file2, buffer2, 0, 100, 0);
fs.readSync(file3, buffer3, 0, 100, 0);