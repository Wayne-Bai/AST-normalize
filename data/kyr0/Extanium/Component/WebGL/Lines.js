function render() {
    try {

        var SCREEN_WIDTH = window.innerWidth,
        SCREEN_HEIGHT = window.innerHeight,

        mouseX = 0, mouseY = 0,

        windowHalfX = window.innerWidth / 2,
        windowHalfY = window.innerHeight / 2,

        SEPARATION = 80,
        AMOUNTX = 15,
        AMOUNTY = 15,

        camera, scene, renderer,

        stats;

        init();
        setInterval(loop, 100 / 60);

        function init() {

            var container, separation = 100, amountX = 1, amountY = 1,
            particles, particle, material;

            container = document.createElement('div');
            document.body.appendChild(container);
            

            camera = new THREE.Camera( 75, SCREEN_WIDTH / SCREEN_HEIGHT, 1, 10000 );
            camera.position.z = 1300;

            scene = new THREE.Scene();

            renderer = new THREE.CanvasRenderer();
            renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
            container.appendChild(renderer.domElement);

            // particles

            material = new THREE.ParticleCircleMaterial( 0xffffff, 1 );
            var geometry = new THREE.Geometry();

            for (var i = 0; i < 30; i++) {

                particle = new THREE.Particle( material );
                particle.position.x = Math.random() * 2 - 1;
                particle.position.y = Math.random() * 2 - 1;
                particle.position.z = Math.random() * 2 - 1;
                particle.position.normalize();
                particle.position.multiplyScalar(Math.random() * 10 + 450);
                particle.scale.x = particle.scale.y = 6;
                scene.add( particle );

                geometry.vertices.push( new THREE.Vertex( particle.position ) );

            }

            // lines

            var line = new THREE.Line( geometry, new THREE.LineColorMaterial( 0xcc0000, Math.random(), 2 ) );
            scene.add(line);

            
            stats = new Stats();
            stats.domElement.style.position = 'absolute';
            stats.domElement.style.top = '0px';
            container.appendChild(stats.domElement);
            

            document.addEventListener('mousemove', onDocumentMouseMove, false);
            document.addEventListener('touchstart', onDocumentTouchStart, false);
            document.addEventListener('touchmove', onDocumentTouchMove, false);
        }

        //

        function onDocumentMouseMove(event) {

            mouseX = event.clientX - windowHalfX;
            mouseY = event.clientY - windowHalfY;
        }

        function onDocumentTouchStart( event ) {

            if(event.touches.length > 1) {

                event.preventDefault();

                mouseX = event.touches[0].pageX - windowHalfX;
                mouseY = event.touches[0].pageY - windowHalfY;
            }
        }

        function onDocumentTouchMove( event ) {

            if(event.touches.length == 1) {

                event.preventDefault();

                mouseX = event.touches[0].pageX - windowHalfX;
                mouseY = event.touches[0].pageY - windowHalfY;
            }
        }

        //

        function loop() {

            camera.position.x += (mouseX - camera.position.x) * .05;
            camera.position.y += (-mouseY + 200 - camera.position.y) * .05;
            camera.updateMatrix();

            renderer.render(scene, camera);

            stats.update();
        }
                
    } catch (e) {

        alert("Error executing 3D script @ Lines.js:");
        alert(e);
    }
}
render();
