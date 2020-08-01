var bindings = require('./bindings'),
    ReferenceType = require('./ReferenceType'),
    BitfieldType = require('./BitfieldType'),
    kernel32 = bindings('kernel32'),
    path = require('path');

var files = new WeakMap,
    paths = {};


module.exports.File = File;

function File(filepath){
  filepath = path.resolve(filepath);
  if (filepath in paths) {
    return files.get(paths[filepath]);
  }
  paths[filepath] = new String(filepath);
  files.set(paths[filepath], this);
  this.path = filepath;
  this.attributes = new FileAttributes(filepath);
}

var pathBuffer = new Buffer(260);

var FileAttributes = new BitfieldType({
  get: function(path){
    pathBuffer.writeCString(path);
    return kernel32.GetFileAttributesA(pathBuffer);
  },
  set: function(path, value){
    pathBuffer.writeCString(path);
    kernel32.SetFileAttributesA(pathBuffer, value);
  },
  cooldown: 10000,
  fields: {
    readonly           : 0x00001,
    hidden             : 0x00002,
    system             : 0x00004,
    volume             : 0x00008,
    directory          : 0x00010,
    archive            : 0x00020,
    device             : 0x00040,
    normal             : 0x00080,
    temporary          : 0x00100,
    sparseFile         : 0x00200,
    reparsePoint       : 0x00400,
    compressed         : 0x00800,
    offline            : 0x01000,
    notContentIndexed  : 0x02000,
    encrypted          : 0x04000,
    integrityStream    : 0x08000,
    virtual            : 0x10000,
    noScrubData        : 0x20000,
  }
});

console.log(new File('..'))
/*
createReadStream
createWriteStream

readdir
mkdir
rmdir

symlink    (path, to, [type], callback)
link       (path, to, callback)
rename     (path, to, callback)
unlink     (path, callback)
readlink   (path, callback)
exists     (path, callback)
realpath   (path, cache, callback)

chown      (path, uid, gid, callback)
chmod      (path, mode, callback)
utimes     (path, atime, mtime, callback)
lutimes    (path, atime, mtime, callback)
stat       (path, callback)
lstat      (path, callback)

appendFile (path, data, [encoding=utf8], callback)
writeFile  (path, data, [encoding], callback)
readFile   (path, [encoding], callback)

open       (path, flags, [mode], callback)
close      (fd, callback)
read       (fd, buffer, offset, length, position, callback)
write      (fd, buffer, offset, length, position, callback)
sendfile   (fd, inFd, offset, length, callback)
truncate   (fd, length, callback)
fchmod     (fd, mode, callback)
futimes    (fd, atime, mtime, callback)
fstat      (fd, callback)
fsync      (fd, callback)
fdatasync  (fd, callback)

watch (filename, [options], [listener])
svn diff -x "-i -b" > mypatch
var modes = {
  'r'   : 1
  'r+'  : 3
  'w'   : 14
  'w+'  : 15
  'a'   : 22
  'a+'  : 23
  'wx'  : 46
  'wx+' : 47
  'ax+' : 55
  'rs'  : 65
  'rs+' : 67
}


var MODE = {
  READ  : 1,
  WRITE : 2,
  CREATE: 4,
  TRUNC : 8,
  APPEND: 16,
  EXCL  : 32,
  SYNC  : 64
};

*/
