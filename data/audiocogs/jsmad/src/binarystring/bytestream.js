Mad.BinaryStrings.ByteStream = function(url) { }

Mad.BinaryStrings.ByteStream.prototype.available = function(n) {
    return this.absoluteAvailable(this.offset + n);
}

Mad.BinaryStrings.ByteStream.prototype.strEquals = function (offset, string) {
    for (var i = 0; i < string.length; i++) {
        if(this.getU8(offset + i, false) != string.charCodeAt(i)) return false;
    }
    return true;
}

Mad.BinaryStrings.ByteStream.prototype.getU8 = function(offset, bigEndian) {
    var bytes = this.get(offset, 1);
    return bytes.charCodeAt(0);
}

Mad.BinaryStrings.ByteStream.prototype.getU16 = function(offset, bigEndian) {
    var bytes = this.get(offset, 2);
    
    if (!bigEndian) {
        bytes = bytes.reverse();
    }
    
    return (bytes.charCodeAt(0) << 8) | bytes.charCodeAt(1);
}

Mad.BinaryStrings.ByteStream.prototype.getU24 = function(offset, bigEndian) {
    var bytes = this.get(offset, 3);
    
    if (!bigEndian) {
        bytes = bytes.reverse();
    }
    
    return (bytes.charCodeAt(0) << 16) | (bytes.charCodeAt(1) << 8) | bytes.charCodeAt(2);
}

Mad.BinaryStrings.ByteStream.prototype.getU32 = function(offset, bigEndian) {
    var bytes = this.get(offset, 4);
    
    if (!bigEndian) {
        bytes = bytes.reverse();
    }
    
    return (bytes.charCodeAt(0) << 24) | (bytes.charCodeAt(1) << 16) | (bytes.charCodeAt(2) << 8) | bytes.charCodeAt(3);
}

Mad.BinaryStrings.ByteStream.prototype.getI8 = function(offset, bigEndian) {
    return this.getU8(offset, bigEndian) - 128;            // 2 ** 7
}

Mad.BinaryStrings.ByteStream.prototype.getI16 = function(offset, bigEndian) {
    return this.getU16(offset, bigEndian) - 65536;         // 2 ** 15
}

Mad.BinaryStrings.ByteStream.prototype.getI32 = function(offset, bigEndian) {
    return this.getU32(offset, bigEndian) - 2147483648;    // 2 ** 31
}

Mad.BinaryStrings.ByteStream.prototype.getSyncInteger = function(offset) {
    var bytes = this.get(offset, 4);
    
    return (bytes.charCodeAt(0) << 21) | (bytes.charCodeAt(1) << 14) | (bytes.charCodeAt(2) << 7) | bytes.charCodeAt(3);
}

Mad.BinaryStrings.ByteStream.prototype.peekU8 = function(bigEndian) {
    return this.getU8(this.offset, bigEndian);
}

Mad.BinaryStrings.ByteStream.prototype.peekU16 = function(bigEndian) {
    return this.getU16(this.offset, bigEndian);
}

Mad.BinaryStrings.ByteStream.prototype.peekU24 = function(bigEndian) {
    return this.getU24(this.offset, bigEndian);
}

Mad.BinaryStrings.ByteStream.prototype.peekU32 = function(bigEndian) {
    return this.getU32(this.offset, bigEndian);
}

Mad.BinaryStrings.ByteStream.prototype.peekI8 = function(bigEndian) {
    return this.getI8(this.offset, bigEndian);
}

Mad.BinaryStrings.ByteStream.prototype.peekI16 = function(bigEndian) {
    return this.getI16(this.offset, bigEndian);
}

Mad.BinaryStrings.ByteStream.prototype.peekI32 = function(bigEndian) {
    return this.getI32(this.offset, bigEndian);
}

Mad.BinaryStrings.ByteStream.prototype.peekSyncInteger = function() {
    return this.getSyncInteger(this.offset);
}

Mad.BinaryStrings.ByteStream.prototype.readU8 = function(bigEndian) {
    var result = this.peekU8(bigEndian);
    
    this.seek(1);
    
    return result;
}

Mad.BinaryStrings.ByteStream.prototype.readU16 = function(bigEndian) {
    var result = this.peekU16(bigEndian);
    
    this.seek(2);
    
    return result;
}

Mad.BinaryStrings.ByteStream.prototype.readU24 = function(bigEndian) {
    var result = this.peekU24(bigEndian);
    
    this.seek(3);
    
    return result;
}

Mad.BinaryStrings.ByteStream.prototype.readU32 = function(bigEndian) {
    var result = this.peekU32(bigEndian);
    
    this.seek(4);
    
    return result;
}

Mad.BinaryStrings.ByteStream.prototype.readI8 = function(bigEndian) {
    var result = this.peekI8(bigEndian);
    
    this.seek(1);
    
    return result;
}

Mad.BinaryStrings.ByteStream.prototype.readI16 = function(bigEndian) {
    var result = this.peekI16(bigEndian);
    
    this.seek(2);
    
    return result;
}

Mad.BinaryStrings.ByteStream.prototype.readI32 = function(bigEndian) {
    var result = this.peekI32(bigEndian);
    
    this.seek(4);
    
    return result;
}

Mad.BinaryStrings.ByteStream.prototype.readSyncInteger = function() {
    var result = this.getSyncInteger(this.offset);
    
    this.seek(4);
    
    return result;
}
