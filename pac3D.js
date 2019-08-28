var scene, camera, renderer;
var mouse, raycaster;

// audio variables
var audio, playPauseBtn, muteBtn, volumeSlider;

var cube;
var floor;

var keyboard = {};
var player = {height: 1.8, speed: 0.2, turnSpeed: Math.PI*0.02};

function init() {
    // Create the scene
    scene = new THREE.Scene();

    // Create the main camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    // Create the renderer
    renderer = new THREE.WebGLRenderer({alpha:true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Set up the main camera
    camera.position.set(0, player.height, 5);
    camera.lookAt(new THREE.Vector3(0, player.height, 0));

    // Create and add a source of light
    var dirLight = new THREE.DirectionalLight();
    dirLight.position.set(0, 0, 5);
    scene.add(dirLight);

    cube = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshBasicMaterial({color: 0x00ff00, wireframe:false}),
    );
    cube.position.y += 0.5;
    scene.add(cube);
    
    floor = new THREE.Mesh(
        new THREE.PlaneGeometry(10, 10, 10, 10),
        new THREE.MeshBasicMaterial({color:0xffffff, wireframe:false})
    );
    floor.rotation.x -= Math.PI / 2;
    scene.add(floor);
    
<<<<<<< HEAD
    //Create a raycaster instances useful to object picking and other things
    mouse = {x : 0, y : 0};
=======
    // Create a raycaster instances useful to object picking and other things
    mouse = { x : 0, y : 0 };
>>>>>>> 83ba243c56261fd895c6afbf5b7476353053c4e0
    raycaster = new THREE.Raycaster();
    renderer.domElement.addEventListener('click', raycast, false);

    initAudioPlayer();
<<<<<<< HEAD

    //Used to add events listenders
=======
    initSettings();
    
    // Used to add events listenders
>>>>>>> 83ba243c56261fd895c6afbf5b7476353053c4e0
    const domEvents = new THREEx.DomEvents(camera, renderer.domElement);

    var loader = new THREE.FontLoader();
    loader.load("fonts/Super_Mario_256.json", 
    
        function(font) {
            var text = new THREE.TextGeometry('PLAY', 
            {
                font: font,
                size: 7,
                height: 3,
                curveSegments: 0,
            });

            var textMaterial = new THREE.MeshPhongMaterial({color: 0xffff00});
            var mesh = new THREE.Mesh(text, textMaterial);
            mesh.position.set(-11, 10, -50);

            scene.add(mesh);

            domEvents.addEventListener(mesh, "mouseover", event => {
                mesh.material.color.setHex(0xffffff);
                $('html,body').css('cursor', 'pointer');
            })

            domEvents.addEventListener(mesh, "mouseout", event => {
                mesh.material.color.setHex(0xffff00);
                $('html,body').css('cursor', 'default');
            })
        },
        
<<<<<<< HEAD
        function(xhr) {
            console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
        },

        // onError callback
	    function(err) {
		    console.log( 'An error happened' );
=======
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },

        // onError callback
	    function (err) {
		    console.log('An error happened');
>>>>>>> 83ba243c56261fd895c6afbf5b7476353053c4e0
	    }
    );

    animate();
}

function animate() {
    requestAnimationFrame(animate);

    if (keyboard[87]) { // W key
        camera.position.x -= Math.sin(camera.rotation.y) * player.speed;
        camera.position.z -= Math.cos(camera.rotation.y) * player.speed;
    }

    if (keyboard[83]) { // S key
        camera.position.x += Math.sin(camera.rotation.y) * player.speed;
        camera.position.z += Math.cos(camera.rotation.y) * player.speed;
    }

    if (keyboard[65]) { // A key
        camera.position.x += Math.sin(camera.rotation.y - Math.PI/2) * player.speed;
        camera.position.z += Math.cos(camera.rotation.y - Math.PI/2) * player.speed;
    }

    if (keyboard[68]) { // D key
        camera.position.x += Math.sin(camera.rotation.y + Math.PI/2) * player.speed;
        camera.position.z += Math.cos(camera.rotation.y + Math.PI/2) * player.speed;
    }

    if (keyboard[37]) { //left arrow key
        camera.rotation.y += player.turnSpeed;
    }

    if (keyboard[39]) { //right arrow key
        camera.rotation.y -= player.turnSpeed;
    }

    //controls.update();
    renderer.render(scene, camera);
}

function raycast(event) {

    // Sets the mouse position with a coordinate system where the center of the screen is the origin
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Set the picking ray from the camera position and mouse coordinates
    raycaster.setFromCamera(mouse, camera);    

    // Compute intersections
    var intersects = raycaster.intersectObjects(scene.children);
    /*
        An intersection has the following properties :
            - object : intersected object (THREE.Mesh)
            - distance : distance from camera to intersection (number)
            - face : intersected face (THREE.Face3)
            - faceIndex : intersected face index (number)
            - point : intersection point (THREE.Vector3)
            - uv : intersection point in the object's UV coordinates (THREE.Vector2)
    */

    for (var i = 0; i < intersects.length; i++) {
        console.log(intersects[i]); 
        intersects[i].object.material.color.setHex(0xffffff);
    }
}

function initAudioPlayer() {
    audio = new Audio();

    // Specify the source
    audio.src = "background_music/pacman_remix.mp3";
    // The audio is gonna loop over the source
    audio.loop = true;
    // Put the audio in pause
    audio.pause();

    playPauseBtn = document.getElementById("playpausebtn");
    muteBtn = document.getElementById("mutebtn");
    volumeSlider = document.getElementById("volumeslider");

    // Setting up the correct volume
    volumeSlider.value = 20;
    audio.volume = 20/100;
    
    // Event handling
    playPauseBtn.onclick = function() {
        if (audio.paused) {
            audio.play();
            playPauseBtn.style.background = "url(images/pause.png) no-repeat";
        } else {
            audio.pause();
            playPauseBtn.style.background = "url(images/play.png) no-repeat";
        }
    };

    muteBtn.onclick = function() {
        if (audio.muted) {
		    audio.muted = false;
            muteBtn.style.background = "url(images/volume-high.png) no-repeat";
	    } else {
		    audio.muted = true;
		    muteBtn.style.background = "url(images/muted.png) no-repeat";
	    }
    };

    volumeSlider.oninput = function() {
        audio.volume = volumeSlider.value/100;
    };
}

function initSettings() {
    // ToDO
}

function keyDown(event) {
    // When you click on keyboard set true to start moving
    keyboard[event.keyCode] = true;
}

function keyUp(event) {
    // When you let the keyboard key, set false to stop moving
    keyboard[event.keyCode] = false;
}

// Arrows listeners
window.addEventListener('keyup', keyUp);
window.addEventListener('keydown', keyDown);

// Resize listeners
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

// This way the audio will be loaded after the page is fully loaded
window.onload = init;
