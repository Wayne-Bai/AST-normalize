// # [FNV](https://en.wikipedia.org/wiki/Fowler%E2%80%93Noll%E2%80%93Vo_hash_function)
//
// hash is a simple non-cryptographic hash.
module.exports = fnv1a;

// FNV-1a hash.
// Defaults to a 32 bit unsigned int from a string. Optional second argument
// specifies number of bits to be kept, clearing out the remaining as 0s.
// For 32-bit: offset = 2166136261, prime = 16777619.
function fnv1a(str, bits) {
    var hash = 0x811C9DC5;
    if (str.length) for (var i = 0; i < str.length; i++) {
        hash = hash ^ str.charCodeAt(i);
        // 2**24 + 2**8 + 0x93 = 16777619
        hash += (hash << 24) + (hash << 8) + (hash << 7) + (hash << 4) + (hash << 1);
    }
    if (bits) {
        var clear = 32 - bits;
        hash = hash >>> clear << clear;
    }
    return hash >>> 0;
}

