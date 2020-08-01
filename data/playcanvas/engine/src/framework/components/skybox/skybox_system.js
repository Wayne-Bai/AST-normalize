pc.extend(pc, function () {

    /**
     * @private
     * @name pc.SkyboxComponentSystem
     * @constructor Create a new SkyboxComponentSystem
     * @class Renders a cube skybox
     * @param {pc.Application} app The running {pc.Application}
     * @extends pc.ComponentSystem
     */
    var SkyboxComponentSystem = function SkyboxComponentSystem (app) {
        this.id = 'skybox';
        this.description = "Renders a skybox in the scene.";
        app.systems.add(this.id, this);

        this.ComponentType = pc.SkyboxComponent;
        this.DataType = pc.SkyboxComponentData;

        this.schema = [{
            name: "enabled",
            displayName: "Enabled",
            description: "Enables or disables the component",
            type: "boolean",
            defaultValue: true
        },{
             name: "posx",
             displayName: "POSX",
             description: "URL of the positive X face of skybox cubemap",
             type: "asset",
                options: {
                    max: 1,
                    type: "texture"
                },
                defaultValue: null
            }, {
             name: "negx",
             displayName: "NEGX",
             description: "URL of the negative X face of skybox cubemap",
                type: "asset",
                options: {
                    max: 1,
                    type: "texture"
                },
                defaultValue: null
            }, {
             name: "posy",
             displayName: "POSY",
             description: "URL of the positive Y face of skybox cubemap",
                type: "asset",
                options: {
                    max: 1,
                    type: "texture"
                },
                defaultValue: null
            }, {
             name: "negy",
             displayName: "NEGY",
             description: "URL of the negative Y face of skybox cubemap",
                type: "asset",
                options: {
                    max: 1,
                    type: "texture"
                },
                defaultValue: null
            }, {
             name: "posz",
             displayName: "POSZ",
             description: "URL of the positive Z face of skybox cubemap",
                type: "asset",
                options: {
                    max: 1,
                    type: "texture"
                },
                defaultValue: null
            }, {
             name: "negz",
             displayName: "NEGZ",
             description: "URL of the negative Z face of skybox cubemap",
                type: "asset",
                options: {
                    max: 1,
                    type: "texture"
                },
                defaultValue: null
            }, {
                name: 'model',
                exposed: false,
                readOnly: true
            }, {
                name: 'assets',
                exposed: false,
                readOnly: true
            }, {
                name: 'cubemap',
                exposed: false
            }
        ];

        this.exposeProperties();

        this.on('remove', this.onRemove, this);
    };
    SkyboxComponentSystem = pc.inherits(SkyboxComponentSystem, pc.ComponentSystem);

    pc.extend(SkyboxComponentSystem.prototype, {
        initializeComponentData: function (component, data, properties) {
            var properties = ['enabled', 'posx', 'negx', 'posy', 'negy', 'posz', 'negz', 'cubemap'];
            SkyboxComponentSystem._super.initializeComponentData.call(this, component, data, properties);
        },

        onRemove: function (entity, data) {
            if (data.model) {
                this.app.scene.removeModel(data.model);
                entity.removeChild(data.model.getGraph());
                data.model = null;
            }
        }
    });

    return {
        SkyboxComponentSystem: SkyboxComponentSystem
    };
}());
