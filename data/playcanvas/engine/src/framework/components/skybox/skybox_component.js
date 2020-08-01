pc.extend(pc, function () {
    /**
     * @private
     * @component
     * @name pc.SkyboxComponent
     * @constructor Create a new SkyboxComponent
     * @class A skybox is cube rendered around the camera. The texture on the inside of the cube is used to display the distant environment in a simple and efficient way.
     * Set a texture Asset to be used for each face of the cube.
     * @extends pc.Component
     * @property {Boolean} enabled Enables or disables rendering of the skybox
     * @property {Number} negx Asset id of texture that is used for negative x face
     * @property {Number} posx Asset id of texture that is used for positive x face
     * @property {Number} negy Asset id of texture that is used for negative y face
     * @property {Number} posy Asset id of texture that is used for positive y face
     * @property {Number} negz Asset id of texture that is used for negative z face
     * @property {Number} posz Asset id of texture that is used for positive z face
     */
    var SkyboxComponent = function SkyboxComponent (system, entity) {
        this.on("set", this.onSet, this);
    };
    SkyboxComponent = pc.inherits(SkyboxComponent, pc.Component);

    pc.extend(SkyboxComponent.prototype, {
        onSet: function (name, oldValue, newValue) {

            if ((name=='cubemap') && (newValue)) {
                this.data.model = _createSkyboxFromCubemap(this.entity, this.system.app, newValue);

                if (this.enabled && this.entity.enabled) {
                    this.system.app.scene.addModel(this.data.model);
                    this.entity.addChild(this.data.model.graph);
                }
                return;
            }

            function _loadTextureAsset(name, id) {
                if (id === undefined || id === null) {
                    return;
                }

                var index = CUBE_MAP_NAMES.indexOf(name);
                var assets = this.entity.skybox.assets;

                // clear existing skybox
                this.data.model = null;

                assets[index] = this.system.app.assets.getAssetById(id);
                if (!assets[index]) {
                    logERROR(pc.string.format("Trying to load skybox component before asset {0} has loaded", id));
                    return;
                }
                this.data.assets = assets;

                // Once all assets are loaded create the skybox
                if (assets[0] && assets[1] && assets[2] && assets[3] && assets[4] && assets[5]) {
                    this.data.model = _createSkybox(this.entity, this.system.app, assets);

                    if (this.enabled && this.entity.enabled) {
                        this.system.app.scene.addModel(this.data.model);
                        this.entity.addChild(this.data.model.graph);
                    }
                }
            }

            var functions = {
                "posx": function (entity, name, oldValue, newValue) {
                        _loadTextureAsset.call(this, name, newValue);
                    },
                "negx": function (entity, name, oldValue, newValue) {
                        _loadTextureAsset.call(this, name, newValue);
                    },
                "posy": function (entity, name, oldValue, newValue) {
                        _loadTextureAsset.call(this, name, newValue);
                    },
                "negy": function (entity, name, oldValue, newValue) {
                        _loadTextureAsset.call(this, name, newValue);
                    },
                "posz": function (entity, name, oldValue, newValue) {
                        _loadTextureAsset.call(this, name, newValue);
                    },
                "negz": function (entity, name, oldValue, newValue) {
                        _loadTextureAsset.call(this, name, newValue);
                    }
                };

            if (functions[name]) {
                functions[name].call(this, this.entity, name, oldValue, newValue);
            }
        },

        onEnable: function () {
           SkyboxComponent._super.onEnable.call(this);
            if (this.data.model) {
                if (!this.system.app.scene.containsModel(this.data.model)) {
                    this.system.app.scene.addModel(this.data.model);
                    this.entity.addChild(this.data.model.graph);
                }
            }
        },

        onDisable: function () {
            SkyboxComponent._super.onDisable.call(this);
            if (this.data.model) {
                if (this.system.app.scene.containsModel(this.data.model)) {
                    this.entity.removeChild(this.data.model.graph);
                    this.system.app.scene.removeModel(this.data.model);
                }
            }
        },
    });

    // Private
    var _createSkybox = function (entity, app, assets) {
        var gd = app.graphicsDevice;

        var sources = [];
        var requests = [];
        var indexes = [];
        var image;

        // find cached assets or create async requests if they are not in the cache
        for (var i=0; i<assets.length; i++) {
            var asset = assets[i];
            if (!asset) {
                logERROR(pc.string.format('Trying to load skybox component before assets are loaded'));
                return;
            } else {
                if (asset.resource) {
                    // skyboxes work with Images not textures, so get the source image of the texture resource
                    image = asset.resource.getSource();
                    if (!image) {
                        logERROR(pc.string.format('Trying to load skybox component with invalid texture types'));
                        return;
                    }

                    sources.push(image);
                } else {
                    indexes.push(i);
                    requests.push(new pc.resources.TextureRequest(asset.getFileUrl()));
                }
            }
        }

        var texture = new pc.Texture(gd, {
            format: pc.PIXELFORMAT_R8_G8_B8,
            cubemap: true
        });
        texture.minFilter = pc.FILTER_LINEAR_MIPMAP_LINEAR;
        texture.magFilter = pc.FILTER_LINEAR;
        texture.addressU = pc.ADDRESS_CLAMP_TO_EDGE;
        texture.addressV = pc.ADDRESS_CLAMP_TO_EDGE;

        if (requests.length) {
            var options = {
                parent: entity.getRequest()
            };

            app.loader.request(requests, options).then(function (resources) {
                for (var i=0; i<resources.length; i++) {
                    sources[indexes[i]] = resources[i].getSource();
                }

                texture.setSource(sources);
            });
        } else {
            texture.setSource(sources);
        }

        var material = new pc.Material();
        material.updateShader = function() {
            var library = gd.getProgramLibrary();
            var shader = library.getProgram('skybox', {hdr:false, gamma:app.scene.gammaCorrection, toneMapping:app.scene.toneMapping});
            this.setShader(shader);
        };

        material.updateShader();
        material.setParameter("texture_cubeMap", texture);
        material.cull = pc.CULLFACE_NONE;

        var node = new pc.GraphNode();
        var mesh = pc.createBox(gd);
        var meshInstance = new pc.MeshInstance(node, mesh, material);

        var model = new pc.Model();
        model.graph = node;
        model.meshInstances = [ meshInstance ];

        return model;
    };

    var _createSkyboxFromCubemap = function (entity, app, cubemap) {
        var gd = app.graphicsDevice;

        var material = new pc.Material();
        material.updateShader = function() {
            var library = gd.getProgramLibrary();
            var shader = library.getProgram('skybox', {hdr:cubemap.hdr, prefiltered:true, gamma:app.scene.gammaCorrection, toneMapping:app.scene.toneMapping});
            this.setShader(shader);
        };

        material.updateShader();
        material.setParameter("texture_cubeMap", cubemap);
        material.cull = pc.CULLFACE_NONE;

        var node = new pc.GraphNode();
        var mesh = pc.createBox(gd);
        var meshInstance = new pc.MeshInstance(node, mesh, material);

        var model = new pc.Model();
        model.graph = node;
        model.meshInstances = [ meshInstance ];

        return model;
    };

    var CUBE_MAP_NAMES = [
        'posx',
        'negx',
        'posy',
        'negy',
        'posz',
        'negz'
    ];

    return {
        SkyboxComponent: SkyboxComponent
    };
}());

