var scene, camera, renderer;
var mouse, raycaster;

// audio variables
var audio, playPauseBtn, muteBtn, volumeSlider;

// settings button
var settingBtn;

var textureWall = new THREE.TextureLoader().load("textures/Grass/grass_01.png");
textureWall.wrapS = THREE.RepeatWrapping;
textureWall.wrapT = THREE.RepeatWrapping;
textureWall.generateMipmaps = true;
textureWall.repeat.set(1, 10);
var textureFloor = new THREE.TextureLoader().load("textures/floor.png");
textureFloor.wrapS = THREE.RepeatWrapping;
textureFloor.wrapT = THREE.RepeatWrapping;
textureFloor.repeat.set(50, 50);
var cube;
var unique_cube = new THREE.BoxGeometry(5, 50, 5);
var cube_material = new THREE.MeshPhongMaterial({color: 0x228B22, wireframe:false, map:textureWall});

var floor;
var maze = new Array(42);
for (i = 0; i < maze.length; i++) {
    maze[i] = new Array(41);
}

var keyboard = {};
var player = {height: 5, speed: 0.2, turnSpeed: Math.PI*0.02};
var pacman;
var pacman_x_dim = 0.5, pacman_y_dim = 0.5, pacman_z_dim = 0.5;

var collidable_objects = [];

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
    camera.position.set(10, player.height, -5);
    camera.lookAt(camera.position.x, camera.position.y, camera.position.z);

    // Create and add a source of light
    var dirLight = new THREE.DirectionalLight();
    dirLight.position.set(0, 10, 0);
    scene.add(dirLight);

    var ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    var pointLight = new THREE.PointLight(0xffffff, 0.8, 18);
    pointLight.position.set(15, 30, -10);
    pointLight.castShadow = true;
    pointLight.shadow.camera.near = 0.1;
    pointLight.shadow.camera.far = 500;
    scene.add(pointLight);
 
    pacman = new THREE.Mesh(
        new THREE.BoxGeometry(pacman_x_dim, pacman_y_dim, pacman_z_dim),
        new THREE.MeshBasicMaterial({color: 0x00ff00, wireframe:false}),
    );
    pacman.position.set(10, player.height, -10);
    scene.add(pacman);
    
    floor = new THREE.Mesh(
        new THREE.PlaneGeometry(205, 211, 10, 10),
        new THREE.MeshPhongMaterial({color:0x808080, wireframe:false, map:textureFloor})
    );
    floor.castShadow = true;
    floor.receiveShadow = true;
    floor.rotation.x -= Math.PI / 2;
    floor.position.x = 100;
    floor.position.z = -103;
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
                    cube.castShadow = true;
                    cube.receiveShadow = true;
                    cube.position.set(5*j, 25, -5*i);
                    scene.add(cube);
                    collidable_objects.push(cube);
            }
        }
    }

    //controls = new THREE.OrbitControls(camera, renderer.domElement);

    animate();
}

function animate() {

    if (keyboard[87]) { // W key

        actual_orientation = -camera.rotation.y;

        var pacman_top_front_right_vertex = new THREE.Vector3(
            pacman.position.x + pacman_x_dim * Math.cos(actual_orientation) + pacman_z_dim * Math.sin(actual_orientation),
            pacman.position.y + pacman_y_dim,
            pacman.position.z + pacman_x_dim * Math.sin(actual_orientation) - pacman_z_dim * Math.cos(actual_orientation)
        );

        var pacman_top_front_left_vertex = new THREE.Vector3(
            pacman.position.x - pacman_x_dim * Math.cos(actual_orientation) + pacman_z_dim * Math.sin(actual_orientation),
            pacman.position.y + pacman_y_dim,
            pacman.position.z - pacman_x_dim * Math.sin(actual_orientation) - pacman_z_dim * Math.cos(actual_orientation)
        );
        
        raycaster.set(pacman_top_front_right_vertex, new THREE.Vector3(
            Math.sin(actual_orientation), 
            0, 
            -Math.cos(actual_orientation)
        ));
        var intersects_top_front_right = raycaster.intersectObjects(collidable_objects);

        raycaster.set(pacman_top_front_left_vertex, new THREE.Vector3(
            Math.sin(actual_orientation), 
            0, 
            -Math.cos(actual_orientation)
        ));
        var intersects_top_front_left = raycaster.intersectObjects(collidable_objects);

        if (((intersects_top_front_right.length > 0 && intersects_top_front_right[0].distance > 0.3) || intersects_top_front_right.length == 0) && 
            ((intersects_top_front_left.length > 0 && intersects_top_front_left[0].distance > 0.3) || intersects_top_front_left.length == 0)) {
            camera.position.x -= Math.sin(camera.rotation.y) * player.speed;
            camera.position.z -= Math.cos(camera.rotation.y) * player.speed;
        }
    }

    if (keyboard[83]) { // S key

        actual_orientation = -camera.rotation.y;

        var top_back_right_vertex = new THREE.Vector3(
            pacman.position.x + pacman_x_dim * Math.cos(actual_orientation) - pacman_z_dim * Math.sin(actual_orientation),
            pacman.position.y + pacman_y_dim,
            pacman.position.z + pacman_x_dim * Math.sin(actual_orientation) + pacman_z_dim * Math.cos(actual_orientation)
        );

        var top_back_left_vertex = new THREE.Vector3(
            pacman.position.x - pacman_x_dim * Math.cos(actual_orientation) - pacman_z_dim * Math.sin(actual_orientation),
            pacman.position.y + pacman_y_dim,
            pacman.position.z - pacman_x_dim * Math.sin(actual_orientation) + pacman_z_dim * Math.cos(actual_orientation)
        );

        raycaster.set(top_back_right_vertex, new THREE.Vector3(
            -Math.sin(actual_orientation), 
            0, 
            Math.cos(actual_orientation)
        ));
        var intersects_top_back_right = raycaster.intersectObjects(collidable_objects);

        raycaster.set(top_back_left_vertex, new THREE.Vector3(
            -Math.sin(actual_orientation), 
            0, 
            Math.cos(actual_orientation)
        ));
        var intersects_top_back_left = raycaster.intersectObjects(collidable_objects);

        if (((intersects_top_back_right.length > 0 && intersects_top_back_right[0].distance > 0.3) || intersects_top_back_right.length == 0) && 
            ((intersects_top_back_left.length > 0 && intersects_top_back_left[0].distance > 0.3) || intersects_top_back_left.length == 0)) {
            camera.position.x += Math.sin(camera.rotation.y) * player.speed;
            camera.position.z += Math.cos(camera.rotation.y) * player.speed;
        }
    }

    if (keyboard[65]) { // A key

        actual_orientation = -camera.rotation.y;

        var pacman_top_front_left_vertex = new THREE.Vector3(
            pacman.position.x - pacman_x_dim * Math.cos(actual_orientation) + pacman_z_dim * Math.sin(actual_orientation),
            pacman.position.y + pacman_y_dim,
            pacman.position.z - pacman_x_dim * Math.sin(actual_orientation) - pacman_z_dim * Math.cos(actual_orientation)
        );

        var top_back_left_vertex = new THREE.Vector3(
            pacman.position.x - pacman_x_dim * Math.cos(actual_orientation) - pacman_z_dim * Math.sin(actual_orientation),
            pacman.position.y + pacman_y_dim,
            pacman.position.z - pacman_x_dim * Math.sin(actual_orientation) + pacman_z_dim * Math.cos(actual_orientation)
        );

        // ToDO Gotta find the direction for left

        raycaster.set(pacman_top_front_left_vertex, new THREE.Vector3(
            Math.sin(actual_orientation), 
            0, 
            -Math.cos(actual_orientation)
        ));
        var intersects_top_front_left = raycaster.intersectObjects(collidable_objects);

        raycaster.set(top_back_left_vertex, new THREE.Vector3(
            -Math.sin(actual_orientation), 
            0, 
            Math.cos(actual_orientation)
        ));
        var intersects_top_back_left = raycaster.intersectObjects(collidable_objects);

        if (((intersects_top_front_left.length > 0 && intersects_top_front_left[0].distance > 0.3) || intersects_top_front_left.length == 0) && 
            ((intersects_top_back_left.length > 0 && intersects_top_back_left[0].distance > 0.3) || intersects_top_back_left.length == 0)) {
            camera.position.x += Math.sin(camera.rotation.y - Math.PI/2) * player.speed;
            camera.position.z += Math.cos(camera.rotation.y - Math.PI/2) * player.speed;

        }
    }

    if (keyboard[68]) { // D key

        actual_orientation = -camera.rotation.y;

        var pacman_top_front_right_vertex = new THREE.Vector3(
            pacman.position.x + pacman_x_dim * Math.cos(actual_orientation) + pacman_z_dim * Math.sin(actual_orientation),
            pacman.position.y + pacman_y_dim,
            pacman.position.z + pacman_x_dim * Math.sin(actual_orientation) - pacman_z_dim * Math.cos(actual_orientation)
        );

        var top_back_right_vertex = new THREE.Vector3(
            pacman.position.x + pacman_x_dim * Math.cos(actual_orientation) - pacman_z_dim * Math.sin(actual_orientation),
            pacman.position.y + pacman_y_dim,
            pacman.position.z + pacman_x_dim * Math.sin(actual_orientation) + pacman_z_dim * Math.cos(actual_orientation)
        );

        // ToDO Gotta find the direction for right

        raycaster.set(top_back_right_vertex, new THREE.Vector3(
            -Math.sin(actual_orientation), 
            0, 
            Math.cos(actual_orientation)
        ));
        var intersects_top_back_right = raycaster.intersectObjects(collidable_objects);

        raycaster.set(pacman_top_front_right_vertex, new THREE.Vector3(
            Math.sin(actual_orientation), 
            0, 
            -Math.cos(actual_orientation)
        ));
        var intersects_top_front_right = raycaster.intersectObjects(collidable_objects);

        if (((intersects_top_front_right.length > 0 && intersects_top_front_right[0].distance > 0.3) || intersects_top_front_right.length == 0) && 
            ((intersects_top_back_right.length > 0 && intersects_top_back_right[0].distance > 0.3) || intersects_top_back_right.length == 0)) {
            camera.position.x += Math.sin(camera.rotation.y + Math.PI/2) * player.speed;
            camera.position.z += Math.cos(camera.rotation.y + Math.PI/2) * player.speed;
        }
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
    pacman.position.set(camera.position.x + Math.cos(camera.rotation.y + Math.PI/2)*0.5, camera.position.y - 1, camera.position.z - Math.sin(camera.rotation.y + Math.PI/2)*0.5);
    pacman.rotation.set(camera.rotation.x, camera.rotation.y, camera.rotation.z);
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
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
