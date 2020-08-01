define(["./Util", "./Constants"], function (Util, constants) {
    "use strict";

    var utf8Decode = Util.utf8Decode,
        utf8Encode = Util.utf8Encode,
        DEBUG = constants._DEBUG,
        fail = Util.fail,
        paddingArray = new Uint8Array(4);

    /**
     * Chunk data format object
     * @class ChunkData
     * @namespace kick.core
     * @constructor
     */
    return function () {
        var MAGIC_NUMBER = 0xF001,
            VERSION_NUMBER = 1,
            Float32ArrayType = 1,
            Float64ArrayType = 2,
            Int16ArrayType = 3,
            Int32ArrayType = 4,
            Int8ArrayType = 5,
            Uint16ArrayType = 6,
            Uint32ArrayType = 7,
            Uint8ArrayType = 8,
            Chunk = function (chunkId, chunkType, chunkDataLength, data) {
                var thisObj = this;
                this.chunkId = chunkId;
                this.chunkType = chunkType;
                this.chunkDataLength = chunkDataLength; // contains the actual data
                this.data = data; // data is assumed to have the length
                Object.defineProperties(this, {
                    paddingSize: {
                        get: function () {
                            var dataSize = thisObj.data.length * thisObj.data.BYTES_PER_ELEMENT,
                                dataSizeMod4 = dataSize % 8;
                            if (dataSizeMod4) {
                                return 8 - dataSizeMod4;
                            }
                            return 0;
                        }
                    },
                    paddingData: {
                        get: function () {
                            return paddingArray.subarray(0, thisObj.paddingSize);
                        }
                    }
                });
            },
            thisObj = this,
            chunks = [],
            /**
             * Return header size in bytes
             * @method getHeaderSize
             * @private
             */
            getHeaderSize = function () {
                return 2 + // magic number
                    2 + // version number
                    4; // number of chunks
            },
            /**
             * Return chunks size in bytes
             * @method
             * @private
             */
            getChunksSize = function () {
                var sum = 0,
                    chunkHeaderLength = 8,
                    i;
                for (i = 0; i < chunks.length; i++) {
                    sum += chunks[i].chunkDataLength +
                        chunkHeaderLength +
                        chunks[i].paddingSize;
                }
                return sum;
            },
            getTypeEnum = function (array) {
                if (array instanceof Float32Array) { return Float32ArrayType; }
                if (array instanceof Float64Array) { return Float64ArrayType; }
                if (array instanceof Int16Array) { return Int16ArrayType; }
                if (array instanceof Int32Array) { return Int32ArrayType; }
                if (array instanceof Int8Array) { return Int8ArrayType; }
                if (array instanceof Uint16Array) { return Uint16ArrayType; }
                if (array instanceof Uint8Array) { return Uint8ArrayType; }
                return null;
            },
            getTypeClass = function (id) {
                if (id === Float32ArrayType) { return Float32Array; }
                if (id === Float64ArrayType) { return Float64Array; }
                if (id === Int16ArrayType) { return Int16Array; }
                if (id === Int32ArrayType) { return Int32Array; }
                if (id === Int8ArrayType) { return Int8Array; }
                if (id === Uint16ArrayType) { return Uint16Array; }
                if (id === Uint8ArrayType) { return Uint8Array; }
                return null;
            };
        /**
         * Size of chunkdata in bytes. Note that the data is added padding so it always fit into a double array.
         * @method getSize
         */
        this.getSize = function () {
            var size = getHeaderSize() + getChunksSize(),
                remainder = size % 8;
            if (remainder !== 0) {
                size += 8 - remainder;
            }
            return size;
        };

        /**
         * @method serialize
         * @return ArrayBuffer
         */
        this.serialize = function () {
            var output = new ArrayBuffer(thisObj.getSize()),
                byteOffset = 0,
                uint8View = new Uint8Array(output, 0),
                uint16View = new Uint16Array(output, byteOffset),
                uint32View,
                i,
                ViewType,
                view;
            uint16View[0] = MAGIC_NUMBER;
            uint16View[1] = VERSION_NUMBER;
            byteOffset += 4;
            uint32View = new Uint32Array(output, byteOffset);
            uint32View[0] = chunks.length;
            byteOffset += 4;
            for (i = 0; i < chunks.length; i++) {
                uint16View = new Uint16Array(output, byteOffset);
                uint16View[0] = chunks[i].chunkId;
                uint16View[1] = chunks[i].chunkType;
                byteOffset += 4;
                uint32View = new Uint32Array(output, byteOffset);
                uint32View[0] = chunks[i].chunkDataLength;
                byteOffset += 4;
                ViewType = getTypeClass(chunks[i].chunkType);
                view = new ViewType(output);
                view.set(chunks[i].data, byteOffset / view.BYTES_PER_ELEMENT);
                byteOffset += chunks[i].chunkDataLength;

                uint8View.set(chunks[i].paddingData, byteOffset); // write padding data
                byteOffset += chunks[i].paddingSize;
            }
            return output;
        };

        /**
         * @method get
         * @param {Number} chunkid
         * @return TypedArrayView[Number]
         */
        this.get = function (chunkid) {
            var i;
            for (i = 0; i < chunks.length; i++) {
                if (chunks[i].chunkId === chunkid) {
                    return chunks[i].data;
                }
            }
            return null;
        };
        /**
         * @method getString
         * @param {Number} chunkid
         * @return String or null
         */
        this.getString = function (chunkid) {
            var value = thisObj.get(chunkid);
            if (value) {
                return utf8Decode(value);
            }
            return null;
        };

        /**
         * @method getNumber
         * @param {Number} chunkid
         * @return String or null
         */
        this.getNumber = function (chunkid) {
            var value = thisObj.get(chunkid);
            if (value) {
                return value[0];
            }
            return null;
        };

        /**
         * @method getArrayBuffer
         * @param {Number} chunkid
         * @return ArrayBuffer  or null if not found
         */
        this.getArrayBuffer = function (chunkid) {
            var value = thisObj.get(chunkid),
                arrayBuffer,
                res;
            if (value) {
                arrayBuffer = new ArrayBuffer(value.length * value.BYTES_PER_ELEMENT);
                res = new Uint8Array(arrayBuffer);
                res.set(value);
                return arrayBuffer;
            }
            return null;
        };

        /**
         * @method remove
         * @param {Number} chunkid
         * @return Boolean true when deleted
         */
        this.remove = function (chunkid) {
            var i;
            for (i = 0; i < chunks.length; i++) {
                if (chunks[i].chunkId === chunkid) {
                    chunks = chunks.splice(i, 1);
                    return true;
                }
            }
            return false;
        };

        /**
         * @method setString
         * @param {Number} chunkId
         * @param {String} str
         */
        this.setString = function (chunkId, str) {
            var array = utf8Encode(str);
            thisObj.set(chunkId, array);
        };

        /**
         * Uses a Float32Array for storing the number. Note that potentially precision can get lost.
         * @method setNumber
         * @param {Number} chunkId
         * @param {Number} num
         */
        this.setNumber = function (chunkId, num) {
            var array = new Float32Array([num]);
            thisObj.set(chunkId, array);
        };

        /**
         * @method setArrayBuffer
         * @param {Number} chunkId
         * @param {ArrayBuffer} arrayBuffer
         */
        this.setArrayBuffer = function (chunkId, arrayBuffer) {
            thisObj.set(chunkId, new Uint8Array(arrayBuffer));
        };

        /**
         * Note that this method saves a reference to the array (it does not copy data)
         * @method set
         * @param {Number} chunkId
         * @param {TypedArrayView} array
         */
        this.set = function (chunkId, array) {
            thisObj.remove(chunkId);
            var chunkType = getTypeEnum(array),
                lengthBytes;
            if (chunkType) {
                lengthBytes = array.length * array.BYTES_PER_ELEMENT;
                chunks.push(new Chunk(chunkId, chunkType, lengthBytes, array));
            } else if (DEBUG) {
                fail("Unsupported array type");
            }
        };

        /**
         * Loads the binary data into the object
         * @method deserialize
         * @param {ArrayBuffer} binaryData
         * @return {boolean} success
         */
        this.deserialize = function (binaryData) {
            if (!(binaryData instanceof ArrayBuffer)) {
                if (DEBUG) {
                    fail("binaryData is not instanceof ArrayBuffer");
                }
                return false;
            }
            var newChunks = [],
                byteOffset = 0,
                uint16View = new Uint16Array(binaryData, byteOffset),
                uint32View,
                chunksLength,
                i,
                chunkId,
                chunkType,
                chunkDataLength,
                DataType,
                data,
                chunk;
            if (uint16View[0] !== MAGIC_NUMBER || uint16View[1] !== VERSION_NUMBER) {
                if (DEBUG) {
                    if (uint16View[0] !== MAGIC_NUMBER) {
                        fail("Invalid magic number");
                    } else {
                        fail("Unsupported version number");
                    }
                }
                return false;
            }
            byteOffset += 4;
            uint32View = new Uint32Array(binaryData, byteOffset);
            chunksLength = uint32View[0];
            byteOffset += 4;
            for (i = 0; i < chunksLength; i++) {
                uint16View = new Uint16Array(binaryData, byteOffset);
                chunkId = uint16View[0];
                chunkType = uint16View[1];
                byteOffset += 4;
                uint32View = new Uint32Array(binaryData, byteOffset);
                chunkDataLength = uint32View[0];
                byteOffset += 4;
                DataType = getTypeClass(chunkType);
                data = new DataType(binaryData, byteOffset, chunkDataLength / DataType.BYTES_PER_ELEMENT);
                chunk = new Chunk(chunkId, chunkType, chunkDataLength, data);
                newChunks.push(chunk);
                byteOffset += chunkDataLength;
                byteOffset += chunk.paddingSize; // skip padding data
            }
            chunks = newChunks;
            return true;
        };
    };
});