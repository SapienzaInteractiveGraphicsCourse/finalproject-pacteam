var scene, camera, renderer;
var mouse, raycaster;

// audio variables
var audio, playPauseBtn, muteBtn, volumeSlider;

// settings button
var settingBtn;

var cube;
var unique_cube = new THREE.BoxGeometry(5, 50, 5);
var cube_material = new THREE.MeshBasicMaterial({color: 0x4f4f4f, wireframe:false});

var floor;
var maze = new Array(42);

for (i = 0; i < maze.length; i++) {
    maze[i] = new Array(41);
}

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
    camera.position.set(0, 400, -120);
    camera.lookAt(200, 0, -120);

    // Create and add a source of light
    var dirLight = new THREE.DirectionalLight();
    dirLight.position.set(0, 0, 5);
    scene.add(dirLight);

    cube = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshBasicMaterial({color: 0x00ff00, wireframe:false}),
    )
    scene.add(cube);
    
    floor = new THREE.Mesh(
        new THREE.PlaneGeometry(215, 205, 10, 10),
        new THREE.MeshBasicMaterial({color:0x808080, wireframe:false})
    );
    floor.rotation.x -= Math.PI / 2;
    floor.position.x = 105;
    floor.position.z = -105;
    scene.add(floor);
    
    //Create a raycaster instances useful to object picking and other things
    mouse = {x : 0, y : 0};
    raycaster = new THREE.Raycaster();
    renderer.domElement.addEventListener('click', raycast, false);

    initAudioPlayer();
    initSettings();

    //Used to add events listenders
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

            //scene.add(mesh);

            domEvents.addEventListener(mesh, "mouseover", event => {
                mesh.material.color.setHex(0xffffff);
                $('html,body').css('cursor', 'pointer');
            });

            domEvents.addEventListener(mesh, "click", event => {
                // Hides the buttons
                volumeSlider.style.display = "none";
                playPauseBtn.style.display = "none";
                muteBtn.style.display = "none";
                settingsBtn.style.display = "none";
                scene.remove(mesh);
            });

            domEvents.addEventListener(mesh, "mouseout", event => {
                mesh.material.color.setHex(0xffff00);
                $('html,body').css('cursor', 'default');
            });
        },
        
        function(xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },

        // onError callback
	    function(err) {
		    console.log('An error happened');
	    }
    );

    createMaze();
    for (i=0; i < maze.length; i++) {
        for (j=0; j < maze[0].length; j++) {
            switch (maze[i][j]) {
                case 1:
                    cube = new THREE.Mesh(unique_cube, cube_material);
                    cube.position.z = -5*i;
                    cube.position.x = 5*j;
                    
                    scene.add(cube);
            }
        }
    }

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

    if (keyboard[37]) {
        camera.rotation.y += player.turnSpeed;
    }

    if (keyboard[39]) {
        camera.rotation.y -= player.turnSpeed;
    }

    if (keyboard[16]) {
        player.speed = 0.4;
    } else {
        player.speed = 0.2;
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
        //intersects[i].object.material.color.setHex(0xffffff);
    }
}

function createMaze() {
    for (i=0; i < maze.length; i++) {
        for (j=0; j < maze[0].length; j++) {
            if (i == 0 || i == maze.length-1) {
                maze[i][j] = 1;
            }

            if ( (j == 0 || j==maze[0].length-1) && (i < 17 || i > 27) ) {
                maze[i][j] = 1;
            }

            if ( (i==16 || i== 28 || i==20 || i==24) && (j<8 || j>=32) ) {
                maze[i][j] = 1;
            }

            if ( (j==8 || j==32) && ( (i>=16 && i<=20) || (i>=24 && i<=28) ) ) {
                maze[i][j] = 1;
            }

            if (i == 4 && ( (j>3 && j<17) || j==20 || (j > 23 && j < 37) )) {
                maze[i][j] = 1;
            }

            if ((i >= maze.length-4) && (j==20)) {
                maze[i][j] = 1;
            }

            if ((i == maze.length - 6 || i == maze.length - 5) && ((j == 20) || (j >= 4 && j <= 8) || (j >= 12 && j <= 16) || (j >= 24 && j <= 28) || (j >= 32 && j <= 36))) {
                maze[i][j] = 1;
            }

            if ((i == maze.length - 10) && ((j >= 4 && j <= 8) || (j == 12) || (j >= 16 && j <= 24) || (j == 28) || (j >= 32 && j <= 36))) {
                maze[i][j] = 1;
            }

            if ((i <= maze.length - 11 && i >= maze.length - 14) && ((j == 12) || (j == 20) ||   (j == 28))) {
                maze[i][j] = 1;
            }

            if ((i <= maze.length - 14 && i >= maze.length - 17) && ((j == 12) || (j == 28))) {
                maze[i][j] = 1;
            }

            if ( (i == maze.length - 18) && ((j==12 || j==28) || (j>15 && j<25))) {
                maze[i][j] = 1;
            }

            if ( (i>=5 && i<=7) && (j==12 || j==20 || j==28)) {
                maze[i][j] = 1;
            }

            if ( (i==8) && (j<5 || j==8 || j==12 || (j>15 && j<25) || j==28 || j==32 || j>35)) {
                maze[i][j] = 1;
            }

            if ( (i>8 && i<12) && (j==8 || j==32)) {
                maze[i][j] = 1;
            }

            if ( (i==12) && ((j>3 && j<9) || (j>11 && j<17) || (j==20) || (j>23 && j<29) || (j>31 && j<37)) ) {
                maze[i][j] = 1;
            }

            if ( (i>12 && i<16) && j==20) {
                maze[i][j] = 1;
            }

            if ( (i==16) && ((j==12 || j==28) || (j>15 && j<25))) {
                maze[i][j] = 1;
            }

            if ( (i>16 && i<20) && (j==12 || j==28)) {
                maze[i][j] = 1;
            }

            if ( (i==20) && ((j==12 || j==28) || (j>15 && j<25))) {
                maze[i][j] = 1;
            }

            if ( (i>20 && i<24) && (j==16 || j==24)) {
                maze[i][j] = 1;
            }
        }
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

    settingsBtn = document.getElementById("settings");
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
