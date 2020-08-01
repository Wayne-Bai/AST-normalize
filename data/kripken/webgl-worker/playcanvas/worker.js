
importScripts('../emshim.js');
importScripts('../webGLWorker.js');
importScripts('../proxyWorker.js');

importScripts('playcanvas-latest.js');

setMain(function() {

        var canvas = document.getElementById("application-canvas");

        // Create the graphics device
        var device = new pc.gfx.Device(canvas);

        // Create renderer
        var renderer = new pc.scene.ForwardRenderer(device);

        // Create Scene
        var scene = new pc.scene.Scene();

        // Create camera node
        var camera = new pc.scene.CameraNode();
        camera.setClearOptions({
            color: [0.4, 0.45, 0.5]
        });
        camera.setLocalPosition(0, 7, 24);

        // Set up a default scene light
        var light = new pc.scene.LightNode();
        light.setType(pc.scene.LIGHTTYPE_POINT);
        light.setAttenuationEnd(100);
        light.setLocalPosition(5, 0, 15);
        light.setEnabled(true);
        scene.addLight(light);

        // Create resource and asset loaders
        var loader = new pc.resources.ResourceLoader();
        var assets = new pc.asset.AssetRegistry(loader);

        // Register loaders for models, textures and materials
        loader.registerHandler(pc.resources.MaterialRequest, new pc.resources.MaterialResourceHandler(assets));
        loader.registerHandler(pc.resources.TextureRequest, new pc.resources.TextureResourceHandler(device));
        loader.registerHandler(pc.resources.ModelRequest, new pc.resources.ModelResourceHandler(device, assets));
        loader.registerHandler(pc.resources.JsonRequest, new pc.resources.JsonResourceHandler());

        var model = null;

        assets.loadFromUrl("assets/Playbot/Playbot.json", "model").then(function (asset) {
            model = asset.resource;
            scene.addModel(model);
        });

        // Setup update, render and tick functions
        var update = function (dt) {
            if (model) {
                model.getGraph().rotate(0, 90*dt, 0);
            }
            scene.update();
        };

        var render = function () {
            renderer.render(scene, camera);
        }

        var time = 0;
        var tick = function () {
            var now = (window.performance && window.performance.now) ? performance.now() : Date.now();
            var dt = (now - (time || now)) / 1000.0;
            time = now;

            update(dt);
            render();

            requestAnimationFrame(tick, canvas);
        }

        // start running
        tick();

});

