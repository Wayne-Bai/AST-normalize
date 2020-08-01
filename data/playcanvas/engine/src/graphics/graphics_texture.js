pc.extend(pc, function () {
    'use strict';

    /**
     * @name pc.Texture
     * @class A texture is a container for texel data that can be utilized in a fragment shader.
     * Typically, the texel data represents an image that is mapped over geometry.
     * @constructor Creates a new texture.
     * @param {pc.GraphicsDevice} graphicsDevice The graphics device used to manage this texture.
     * @param {Object} options Options that control the main properties of a texture.
     * @property {Number} minFilter The minification filter to be applied to the texture (see pc.FILTER_*).
     * @property {Number} magFilter The magnification filter to be applied to the texture (see pc.FILTER_*).
     * @property {Number} addressU The addressing mode to be applied to the texture (see pc.ADDRESS_*).
     * @property {Number} addressV The addressing mode to be applied to the texture (see pc.ADDRESS_*).
     * @property {Number} anisotropy Integer value specifying the level of anisotropic to apply to the texture
     * ranging from 1 (no anisotropic filtering) to the pc.GraphicsDevice property maxAnisotropy.
     * @property {Number} width [Read only] The width of the based mip level in pixels.
     * @property {Number} height [Read only] The height of the based mip level in pixels.
     * @property {Number} format [Read only] The pixel format of the texture (see pc.PIXELFORMAT_*).
     * @author Will Eastcott
     */
    var Texture = function (graphicsDevice, options) {
        this.device = graphicsDevice;

        // Defaults
        var width = 4;
        var height = 4;
        var format = pc.PIXELFORMAT_R8_G8_B8_A8;
        var cubemap = false;
        var autoMipmap = true;
        var rgbm = false;
        var fixCubemapSeams = false;

        if (options !== undefined) {
            width = (options.width !== undefined) ? options.width : width;
            height = (options.height !== undefined) ? options.height : height;
            format = (options.format !== undefined) ? options.format : format;
            cubemap = (options.cubemap !== undefined) ? options.cubemap : cubemap;
            autoMipmap = (options.autoMipmap !== undefined) ? options.autoMipmap : autoMipmap;
            rgbm = (options.rgbm !== undefined)? options.rgbm : rgbm;
            fixCubemapSeams = (options.fixCubemapSeams !== undefined)? options.fixCubemapSeams : fixCubemapSeams;
        }

        // PUBLIC
        this.name = null;
        this.autoMipmap = autoMipmap;
        this.rgbm = rgbm;
        this.fixCubemapSeams = fixCubemapSeams;

        // PRIVATE
        this._cubemap = cubemap;
        this._format = format;
        this._compressed = (format === pc.PIXELFORMAT_DXT1 ||
                            format === pc.PIXELFORMAT_DXT3 ||
                            format === pc.PIXELFORMAT_DXT5 ||
                            format === pc.PIXELFORMAT_ETC1);

        // Set the new texture to be 4x4 (minimum supported texture size)
        this._width = width || 4;
        this._height = height || 4;

        this._addressU = pc.ADDRESS_REPEAT;
        this._addressV = pc.ADDRESS_REPEAT;

        if (pc.math.powerOfTwo(this._width) && pc.math.powerOfTwo(this._height)) {
            this._minFilter = pc.FILTER_LINEAR_MIPMAP_LINEAR;
        } else {
            this._minFilter = pc.FILTER_LINEAR;
        }
        this._magFilter = pc.FILTER_LINEAR;
        this._anisotropy = 1;

        // Mip levels
        this._levels = cubemap ? [[ null, null, null, null, null, null ]] : [ null ];
        this._lockedLevel = -1;

        this._needsUpload = true;
    };

    // Public properties
    Object.defineProperty(Texture.prototype, 'minFilter', {
        get: function () { return this._minFilter; },
        set: function (filter) {
            if (!(pc.math.powerOfTwo(this._width) && pc.math.powerOfTwo(this._height))) {
                if (!((filter === pc.FILTER_NEAREST) || (filter === pc.FILTER_LINEAR)))  {
                    logWARNING("Invalid minification filter mode set on non power of two texture. Forcing linear addressing.");
                    filter = pc.FILTER_LINEAR;
                }
            }
            this._minFilter = filter;
        }
    });

    Object.defineProperty(Texture.prototype, 'magFilter', {
        get: function() { return this._magFilter; },
        set: function(magFilter) {
            if (!((magFilter === pc.FILTER_NEAREST) || (magFilter === pc.FILTER_LINEAR)))  {
                logWARNING("Invalid magnification filter mode. Must be set to FILTER_NEAREST or FILTER_LINEAR.");
            }
            this._magFilter = magFilter;
        }
    });

    Object.defineProperty(Texture.prototype, 'addressU', {
        get: function() { return this._addressU; },
        set: function(addressU) {
            if (!(pc.math.powerOfTwo(this._width) && pc.math.powerOfTwo(this._height))) {
                if (addressU !== pc.ADDRESS_CLAMP_TO_EDGE) {
                    logWARNING("Invalid address mode in U set on non power of two texture. Forcing clamp to edge addressing.");
                    addressU = pc.ADDRESS_CLAMP_TO_EDGE;
                }
            }
            this._addressU = addressU;
        }
    });

    Object.defineProperty(Texture.prototype, 'addressV', {
        get: function() { return this._addressV; },
        set: function(addressV) {
            if (!(pc.math.powerOfTwo(this._width) && pc.math.powerOfTwo(this._height))) {
                if (addressV !== pc.ADDRESS_CLAMP_TO_EDGE) {
                    logWARNING("Invalid address mode in V set on non power of two texture. Forcing clamp to edge addressing.");
                    addressV = pc.ADDRESS_CLAMP_TO_EDGE;
                }
            }
            this._addressV = addressV;
        }
    });

    Object.defineProperty(Texture.prototype, 'anisotropy', {
        get: function () { return this._anisotropy; },
        set: function (anisotropy) {
            this._anisotropy = anisotropy;
        }
    });

    Object.defineProperty(Texture.prototype, 'width', {
        get: function() { return this._width; }
    });

    Object.defineProperty(Texture.prototype, 'height', {
        get: function() { return this._height; }
    });

    Object.defineProperty(Texture.prototype, 'format', {
        get: function() { return this._format; }
    });

    Object.defineProperty(Texture.prototype, 'cubemap', {
        get: function() { return this._cubemap; }
    });

    // Public methods
    pc.extend(Texture.prototype, {
        /**
         * @private
         * @function
         * @name pc.Texture#bind
         * @description Activates the specified texture on the current texture unit.
         */
        bind: function () {
        },

        /**
         * @function
         * @name pc.Texture#destroy
         * @description Forcibly free up the underlying WebGL resource owned by the texture.
         */
        destroy: function () {
            if (this._glTextureId) {
                var gl = this.device.gl;
                gl.deleteTexture(this._glTextureId);
            }
        },

        /**
         * @function
         * @name pc.Texture#lock
         * @description Locks a miplevel of the texture, returning a typed array to be filled with pixel data.
         * @param {Object} options Optional options object. Valid properties are as follows:
         * @param {Number} options.level The mip level to lock with 0 being the top level. Defaults to 0.
         * @param {Number} options.face If the texture is a cubemap, this is the index of the face to lock.
         */
        lock: function (options) {
            // Initialize options to some sensible defaults
            options = options || { level: 0, face: 0, mode: pc.TEXTURELOCK_WRITE };
            if (options.level === undefined) { options.level = 0; }
            if (options.face === undefined) { options.face = 0; }
            if (options.mode === undefined) { options.mode = pc.TEXTURELOCK_WRITE; }

            this._lockedLevel = options.level;

            if (this._levels[options.level] === null) {
                switch(this._format) {
                    case pc.PIXELFORMAT_A8:
                    case pc.PIXELFORMAT_L8:
                        this._levels[options.level] = new Uint8Array(this._width * this._height);
                        break;
                    case pc.PIXELFORMAT_L8_A8:
                        this._levels[options.level] = new Uint8Array(this._width * this._height * 2);
                        break;
                    case pc.PIXELFORMAT_R5_G6_B5:
                    case pc.PIXELFORMAT_R5_G5_B5_A1:
                    case pc.PIXELFORMAT_R4_G4_B4_A4:
                        this._levels[options.level] = new Uint16Array(this._width * this._height);
                        break;
                    case pc.PIXELFORMAT_R8_G8_B8:
                        this._levels[options.level] = new Uint8Array(this._width * this._height * 3);
                        break;
                    case pc.PIXELFORMAT_R8_G8_B8_A8:
                        this._levels[options.level] = new Uint8Array(this._width * this._height * 4);
                        break;
                    case pc.PIXELFORMAT_DXT1:
                        this._levels[options.level] = new Uint8Array(Math.floor((this._width + 3) / 4) * Math.floor((this._height + 3) / 4) * 8);
                        break;
                    case pc.PIXELFORMAT_DXT3:
                    case pc.PIXELFORMAT_DXT5:
                        this._levels[options.level] = new Uint8Array(Math.floor((this._width + 3) / 4) * Math.floor((this._height + 3) / 4) * 16);
                        break;
                    case pc.PIXELFORMAT_RGB16F:
                    case pc.PIXELFORMAT_RGB32F:
                        this._levels[options.level] = new Float32Array(this._width * this._height * 3);
                        break;
                    case pc.PIXELFORMAT_RGBA16F:
                    case pc.PIXELFORMAT_RGBA32F:
                        this._levels[options.level] = new Float32Array(this._width * this._height * 4);
                        break;
                }
            }

            return this._levels[options.level];
        },

        /**
         * @private
         * @function
         * @name pc.Texture#recover
         * @description Restores the texture in the event of the underlying WebGL context being lost and then
         * restored.
         */
        recover: function () {
        },

        /**
         * @function
         * @name pc.Texture#load
         * @description Load 6 Image resources to use as the sources of the texture.
         * @param {Array} urls A list of 6 URLs for the image resources to load
         * @param {pc.resources.ResourceLoader} loader The ResourceLoader to fetch the resources with
         * @param {Number} [batch] A existing RequestBatch handle to append this request to.
         */
        load: function (src, loader, requestBatch) {
            if (this._cubemap) {
                var options = {
                    batch: requestBatch
                };

                var requests = src.map(function (url) {
                    return new pc.resources.ImageRequest(url);
                });

                loader.request(requests).then(function (resources) {
                    this.setSource(resources);
                }.bind(this));
            } else {
                var request = new pc.resources.ImageRequest(src);

                loader.request(request).then(function (resources) {
                    this.setSource(resources[0]);
                }.bind(this));
            }
        },

        /**
         * @function
         * @name pc.Texture#setSource
         * @description Set the pixel data of the texture from an canvas, image, video DOM element. If the
         * texture is a cubemap, the supplied source must be an array of 6 canvases, images or videos.
         * @param {Array} source Array of 6 HTMLCanvasElement, HTMLImageElement or HTMLVideoElement objects.
         * for the specified texture.
         */
        setSource: function (source) {
            if (this._cubemap) {
                // Check a valid source has been passed in
                logASSERT(Object.prototype.toString.apply(source) === '[object Array]', "pc.Texture: setSource: supplied source is not an array");
                logASSERT(source.length === 6, "pc.Texture: setSource: supplied source does not have 6 entries.");
                var validTypes = 0;
                var validDimensions = true;
                var width = source[0].width;
                var height = source[0].height;
                for (var i = 0; i < 6; i++) {
                    if ((source[i] instanceof HTMLCanvasElement) ||
                        (source[i] instanceof HTMLImageElement) ||
                        (source[i] instanceof HTMLVideoElement)) {
                        validTypes++;
                    }
                    if (source[i].width !== width) validDimensions = false;
                    if (source[i].height !== height) validDimensions = false;
                }
                logASSERT(validTypes === 6, "pc.Texture: setSource: Not all supplied source elements are of required type (canvas, image or video).");
                logASSERT(validDimensions,  "pc.Texture: setSource: Not all supplied source elements share the same dimensions.");

                // If there are mip levels allocated, blow them away
                this._width  = source[0].width;
                this._height = source[0].height;
                this._levels[0] = source;
            } else {
                // Check a valid source has been passed in
                logASSERT((source instanceof HTMLCanvasElement) || (source instanceof HTMLImageElement) || (source instanceof HTMLVideoElement),
                    "pc.Texture: setSource: supplied source is not an instance of HTMLCanvasElement, HTMLImageElement or HTMLVideoElement.");

                this._width  = source.width;
                this._height = source.height;
                this._levels[0] = source;
            }

            this.upload();
            // Reset filter and address modes because width/height may have changed
            this.minFilter = this._minFilter;
            this.magFilter = this._magFilter;
            this.addressu = this._addressu;
            this.addressv = this._addressv;
        },

        /**
         * @function
         * @name pc.Texture#getSource
         * @description Get the pixel data of the texture. If this is a cubemap then an array of 6 images will be returned otherwise
         * a single image.
         * @return {Image} The source image of this texture.
         */
        getSource: function () {
            return this._levels[0];
        },

        /**
         * @function
         * @name pc.Texture#unlock
         * @description Unlocks the currently locked mip level and uploads it to VRAM.
         */
        unlock: function () {
            logASSERT(this._lockedLevel !== -1, "Attempting to unlock a texture that is not locked");

            // Upload the new pixel data
            this.upload();
            this._lockedLevel = -1;
        },

        /**
         * @function
         * @name pc.Texture#upload
         * @description Forces a reupload of the textures pixel data to graphics memory. Ordinarily, this function
         * is called by internally by pc.Texture#setSource and pc.Texture#unlock. However, it still needs to
         * be called explicitly in the case where an HTMLVideoElement is set as the source of the texture.  Normally,
         * this is done once every frame before video textured geometry is rendered.
         */
        upload: function () {
            this._needsUpload = true;
        },

        getDds: function () {
            if (this.format!=pc.PIXELFORMAT_R8_G8_B8_A8) {
                console.error("This format is not implemented yet");
            }
            var fsize = 128;
            var i = 0;
            var j;
            var face;
            while(this._levels[i]) {
                if (!this.cubemap) {
                    var mipSize = this._levels[i].length;
                    if (!mipSize) {
                        console.error("No byte array for mip " + i);
                        return;
                    }
                    fsize += mipSize;
                } else {
                    for(face=0; face<6; face++) {
                        var mipSize = this._levels[i][face].length;
                        if (!mipSize) {
                            console.error("No byte array for mip " + i + ", face " + face);
                            return;
                        }
                        fsize += mipSize;
                    }
                }
                var mipSize
                fsize += this._levels[i].length;
                i++;
            }

            var buff = new ArrayBuffer(fsize);
            var header = new Uint32Array(buff, 0, 128 / 4);

            var DDS_MAGIC = 542327876; // "DDS"
            var DDS_HEADER_SIZE = 124;
            var DDS_FLAGS_REQUIRED = 0x01 | 0x02 | 0x04 | 0x1000 | 0x80000; // caps | height | width | pixelformat | linearsize
            var DDS_FLAGS_MIPMAP = 0x20000;
            var DDS_PIXELFORMAT_SIZE = 32;
            var DDS_PIXELFLAGS_RGBA8 = 0x01 | 0x40; // alpha | rgb
            var DDS_CAPS_REQUIRED = 0x1000;
            var DDS_CAPS_MIPMAP = 0x400000;
            var DDS_CAPS_COMPLEX = 0x8;
            var DDS_CAPS2_CUBEMAP = 0x200 | 0x400 | 0x800 | 0x1000 | 0x2000 | 0x4000 | 0x8000; // cubemap | all faces

            var flags = DDS_FLAGS_REQUIRED;
            if (this._levels.length > 1) flags |= DDS_FLAGS_MIPMAP;

            var caps = DDS_CAPS_REQUIRED;
            if (this._levels.length > 1) caps |= DDS_CAPS_MIPMAP;
            if (this._levels.length > 1 || this.cubemap) caps |= DDS_CAPS_COMPLEX;

            var caps2 = this.cubemap? DDS_CAPS2_CUBEMAP : 0;

            header[0] = DDS_MAGIC;
            header[1] = DDS_HEADER_SIZE;
            header[2] = flags;
            header[3] = this.height;
            header[4] = this.width;
            header[5] = this.width * this.height * 4;
            header[6] = 0; // depth
            header[7] = this._levels.length;
            for(i=0; i<11; i++) header[8 + i] = 0;
            header[19] = DDS_PIXELFORMAT_SIZE;
            header[20] = DDS_PIXELFLAGS_RGBA8;
            header[21] = 0; // fourcc
            header[22] = 32; // bpp
            header[23] = 0x00FF0000; // R mask
            header[24] = 0x0000FF00; // G mask
            header[25] = 0x000000FF; // B mask
            header[26] = 0xFF000000; // A mask
            header[27] = caps;
            header[28] = caps2;
            header[29] = 0;
            header[30] = 0;
            header[31] = 0;

            var offset = 128;
            if (!this.cubemap) {
                for(i=0; i<this._levels.length; i++) {
                    var level = this._levels[i];
                    var mip = new Uint8Array(buff, offset, level.length)
                    for(j=0; j<level.length; j++) mip[j] = level[j];
                    offset += level.length;
                }
            } else {
                for(face=0; face<6; face++) {
                    for(i=0; i<this._levels.length; i++) {
                        var level = this._levels[i][face];
                        var mip = new Uint8Array(buff, offset, level.length)
                        for(j=0; j<level.length; j++) mip[j] = level[j];
                        offset += level.length;
                    }
                }
            }

            return buff;
        }
    });

    return {
        Texture: Texture
    };
}());
