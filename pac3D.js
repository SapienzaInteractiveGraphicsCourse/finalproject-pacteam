var scene, camera, renderer;
var mouse, raycaster;

// audio variables
var audio, playPauseBtn, muteBtn, volumeSlider;

// settings button
var settingBtn;

// Textures
var textureWall = new THREE.TextureLoader().load("textures/Grass/grass_01.png");
textureWall.wrapS = THREE.RepeatWrapping;
textureWall.wrapT = THREE.RepeatWrapping;
textureWall.generateMipmaps = true;
textureWall.repeat.set(1, 10);
var textureFloor = new THREE.TextureLoader().load("textures/floor.png");
textureFloor.wrapS = THREE.RepeatWrapping;
textureFloor.wrapT = THREE.RepeatWrapping;
textureFloor.repeat.set(50, 50);

// Maze
var floor;

var cube;
const unique_cube = new THREE.BoxGeometry(5, 50, 5);
const cube_material = new THREE.MeshPhongMaterial({color: 0x228B22, wireframe:false, map:textureWall});

var ball;
const unique_ball = new THREE.SphereGeometry(1, 4, 4);
const ball_material = new THREE.MeshPhongMaterial(0xffffff);

var keyboard = {};
var player = {height: 5, speed: 0.2, turn_speed: Math.PI*0.02, wall_distance: 0.3, score: 0.0};

// Pacman variables
var pacman;
var pacman_x_dim = 1, pacman_y_dim = 1, pacman_z_dim = 1;

// Collision variables
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
    mouse = {x: 0, y: 0};
    raycaster = new THREE.Raycaster();

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

    const labirinth = new Labirinth();
    labirinth.createMaze();
    labirinth.createBalls();

    for (var i=0; i<labirinth.maze.length; i++) {
        for (var j=0; j<labirinth.maze[0].length) {
            if (labirinth.maze[i][j] == 1) {
                cube = new
            }
        }
    }

    animate();
}

function animate() {

    if (keyboard[87]) { // W key

        actual_orientation = -camera.rotation.y;

        var top_front_right_vertex = new THREE.Vector3(
            pacman.position.x + pacman_x_dim / 2 * Math.cos(actual_orientation) + pacman_z_dim / 2 * Math.sin(actual_orientation),
            pacman.position.y + pacman_y_dim / 2,
            pacman.position.z + pacman_x_dim / 2 * Math.sin(actual_orientation) - pacman_z_dim / 2 * Math.cos(actual_orientation)
        );

        var top_front_left_vertex = new THREE.Vector3(
            pacman.position.x - pacman_x_dim / 2 * Math.cos(actual_orientation) + pacman_z_dim / 2 * Math.sin(actual_orientation),
            pacman.position.y + pacman_y_dim / 2,
            pacman.position.z - pacman_x_dim / 2 * Math.sin(actual_orientation) - pacman_z_dim / 2 * Math.cos(actual_orientation)
        );
        
        raycaster.set(top_front_right_vertex, new THREE.Vector3(
            Math.sin(actual_orientation), 
            0, 
            -Math.cos(actual_orientation)
        ));
        var intersects_top_front_right = raycaster.intersectObjects(collidable_objects);

        raycaster.set(top_front_left_vertex, new THREE.Vector3(
            Math.sin(actual_orientation), 
            0, 
            -Math.cos(actual_orientation)
        ));
        var intersects_top_front_left = raycaster.intersectObjects(collidable_objects);

        if (((intersects_top_front_right.length > 0 && intersects_top_front_right[0].distance > player.wall_distance) || intersects_top_front_right.length == 0) && 
            ((intersects_top_front_left.length > 0 && intersects_top_front_left[0].distance > player.wall_distance) || intersects_top_front_left.length == 0)) {
            camera.position.x -= Math.sin(camera.rotation.y) * player.speed;
            camera.position.z -= Math.cos(camera.rotation.y) * player.speed;
        }
    }

    if (keyboard[83]) { // S key

        actual_orientation = -camera.rotation.y;

        var top_back_right_vertex = new THREE.Vector3(
            pacman.position.x + pacman_x_dim / 2 * Math.cos(actual_orientation) - pacman_z_dim / 2 * Math.sin(actual_orientation),
            pacman.position.y + pacman_y_dim / 2,
            pacman.position.z + pacman_x_dim / 2 * Math.sin(actual_orientation) + pacman_z_dim / 2 * Math.cos(actual_orientation)
        );

        var top_back_left_vertex = new THREE.Vector3(
            pacman.position.x - pacman_x_dim / 2 * Math.cos(actual_orientation) - pacman_z_dim / 2 * Math.sin(actual_orientation),
            pacman.position.y + pacman_y_dim / 2,
            pacman.position.z - pacman_x_dim / 2 * Math.sin(actual_orientation) + pacman_z_dim / 2 * Math.cos(actual_orientation)
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

        if (((intersects_top_back_right.length > 0 && intersects_top_back_right[0].distance > player.wall_distance) || intersects_top_back_right.length == 0) && 
            ((intersects_top_back_left.length > 0 && intersects_top_back_left[0].distance > player.wall_distance) || intersects_top_back_left.length == 0)) {
            camera.position.x += Math.sin(camera.rotation.y) * player.speed;
            camera.position.z += Math.cos(camera.rotation.y) * player.speed;
        }
    }

    if (keyboard[65]) { // A key

        actual_orientation = -camera.rotation.y;

        var top_front_left_vertex = new THREE.Vector3(
            pacman.position.x - pacman_x_dim / 2 * Math.cos(actual_orientation) + pacman_z_dim / 2 * Math.sin(actual_orientation),
            pacman.position.y + pacman_y_dim / 2,
            pacman.position.z - pacman_x_dim / 2 * Math.sin(actual_orientation) - pacman_z_dim / 2 * Math.cos(actual_orientation)
        );

        var top_back_left_vertex = new THREE.Vector3(
            pacman.position.x - pacman_x_dim / 2 * Math.cos(actual_orientation) - pacman_z_dim / 2 * Math.sin(actual_orientation),
            pacman.position.y + pacman_y_dim / 2,
            pacman.position.z - pacman_x_dim / 2 * Math.sin(actual_orientation) + pacman_z_dim / 2 * Math.cos(actual_orientation)
        );

        raycaster.set(top_front_left_vertex, new THREE.Vector3(
            -Math.cos(actual_orientation), 
            0, 
            -Math.sin(actual_orientation)
        ));
        var intersects_top_front_left = raycaster.intersectObjects(collidable_objects);

        raycaster.set(top_back_left_vertex, new THREE.Vector3(
            -Math.cos(actual_orientation), 
            0, 
            -Math.sin(actual_orientation)
        ));
        var intersects_top_back_left = raycaster.intersectObjects(collidable_objects);

        if (((intersects_top_front_left.length > 0 && intersects_top_front_left[0].distance > player.wall_distance) || intersects_top_front_left.length == 0) && 
            ((intersects_top_back_left.length > 0 && intersects_top_back_left[0].distance > player.wall_distance) || intersects_top_back_left.length == 0)) {
            camera.position.x += Math.sin(camera.rotation.y - Math.PI/2) * player.speed;
            camera.position.z += Math.cos(camera.rotation.y - Math.PI/2) * player.speed;
        }
    }

    if (keyboard[68]) { // D key

        actual_orientation = -camera.rotation.y;

        var top_front_right_vertex = new THREE.Vector3(
            pacman.position.x + pacman_x_dim / 2 * Math.cos(actual_orientation) + pacman_z_dim / 2 * Math.sin(actual_orientation),
            pacman.position.y + pacman_y_dim / 2,
            pacman.position.z + pacman_x_dim / 2 * Math.sin(actual_orientation) - pacman_z_dim / 2 * Math.cos(actual_orientation)
        );

        var top_back_right_vertex = new THREE.Vector3(
            pacman.position.x + pacman_x_dim / 2 * Math.cos(actual_orientation) - pacman_z_dim / 2 * Math.sin(actual_orientation),
            pacman.position.y + pacman_y_dim / 2,
            pacman.position.z + pacman_x_dim / 2 * Math.sin(actual_orientation) + pacman_z_dim / 2 * Math.cos(actual_orientation)
        );

        raycaster.set(top_back_right_vertex, new THREE.Vector3(
            Math.cos(actual_orientation), 
            0, 
            Math.sin(actual_orientation)
        ));
        var intersects_top_back_right = raycaster.intersectObjects(collidable_objects);

        raycaster.set(top_front_right_vertex, new THREE.Vector3(
            Math.cos(actual_orientation), 
            0, 
            Math.sin(actual_orientation)
        ));
        var intersects_top_front_right = raycaster.intersectObjects(collidable_objects);

        if (((intersects_top_front_right.length > 0 && intersects_top_front_right[0].distance > player.wall_distance) || intersects_top_front_right.length == 0) && 
            ((intersects_top_back_right.length > 0 && intersects_top_back_right[0].distance > player.wall_distance) || intersects_top_back_right.length == 0)) {
            camera.position.x += Math.sin(camera.rotation.y + Math.PI/2) * player.speed;
            camera.position.z += Math.cos(camera.rotation.y + Math.PI/2) * player.speed;
        }
    }

    if (keyboard[37]) { // left arrow

        actual_orientation = -camera.rotation.y;

        var top_front_right_vertex = new THREE.Vector3(
            pacman.position.x + pacman_x_dim / 2 * Math.cos(actual_orientation) + pacman_z_dim / 2 * Math.sin(actual_orientation),
            pacman.position.y + pacman_y_dim / 2,
            pacman.position.z + pacman_x_dim / 2 * Math.sin(actual_orientation) - pacman_z_dim / 2 * Math.cos(actual_orientation)
        );

        var top_front_left_vertex = new THREE.Vector3(
            pacman.position.x - pacman_x_dim / 2 * Math.cos(actual_orientation) + pacman_z_dim / 2 * Math.sin(actual_orientation),
            pacman.position.y + pacman_y_dim / 2,
            pacman.position.z - pacman_x_dim / 2 * Math.sin(actual_orientation) - pacman_z_dim / 2 * Math.cos(actual_orientation)
        );

        raycaster.set(top_front_right_vertex, new THREE.Vector3(
            Math.cos(actual_orientation), 
            0, 
            Math.sin(actual_orientation)
        ));
        var intersects_top_front_right = raycaster.intersectObjects(collidable_objects);

        raycaster.set(top_front_left_vertex, new THREE.Vector3(
            -Math.cos(actual_orientation), 
            0, 
            -Math.sin(actual_orientation)
        ));
        var intersects_top_front_left = raycaster.intersectObjects(collidable_objects);


        if (((intersects_top_front_right.length > 0 && intersects_top_front_right[0].distance > player.wall_distance) || intersects_top_front_right.length == 0) &&
            ((intersects_top_front_left.length > 0 && intersects_top_front_left[0].distance > player.wall_distance) || intersects_top_front_left.length == 0)) {
            camera.rotation.y += player.turn_speed;
        }
    }

    if (keyboard[39]) { // right arrow

        actual_orientation = -camera.rotation.y;

        var top_front_right_vertex = new THREE.Vector3(
            pacman.position.x + pacman_x_dim / 2 * Math.cos(actual_orientation) + pacman_z_dim / 2 * Math.sin(actual_orientation),
            pacman.position.y + pacman_y_dim / 2,
            pacman.position.z + pacman_x_dim / 2 * Math.sin(actual_orientation) - pacman_z_dim / 2 * Math.cos(actual_orientation)
        );

        var top_front_left_vertex = new THREE.Vector3(
            pacman.position.x - pacman_x_dim / 2 * Math.cos(actual_orientation) + pacman_z_dim / 2 * Math.sin(actual_orientation),
            pacman.position.y + pacman_y_dim / 2,
            pacman.position.z - pacman_x_dim / 2 * Math.sin(actual_orientation) - pacman_z_dim / 2 * Math.cos(actual_orientation)
        );

        raycaster.set(top_front_right_vertex, new THREE.Vector3(
            Math.cos(actual_orientation), 
            0, 
            Math.sin(actual_orientation)
        ));
        var intersects_top_front_right = raycaster.intersectObjects(collidable_objects);

        raycaster.set(top_front_left_vertex, new THREE.Vector3(
            -Math.cos(actual_orientation), 
            0, 
            -Math.sin(actual_orientation)
        ));
        var intersects_top_front_left = raycaster.intersectObjects(collidable_objects);

        if (((intersects_top_front_right.length > 0 && intersects_top_front_right[0].distance > player.wall_distance) || intersects_top_front_right.length == 0) &&
            ((intersects_top_front_left.length > 0 && intersects_top_front_left[0].distance > player.wall_distance) || intersects_top_front_left.length == 0)) {
            camera.rotation.y -= player.turn_speed;
        }
    }

    if (keyboard[16]) {
        player.speed = 0.4;
        player.wall_distance = 0.6;
    } else {
        player.speed = 0.2;
        player.wall_distance = 0.3;
    }

    //controls.update();
    pacman.position.set(camera.position.x + Math.cos(camera.rotation.y + Math.PI/2)*0.5, camera.position.y - 1, camera.position.z - Math.sin(camera.rotation.y + Math.PI/2)*0.5);
    pacman.rotation.set(camera.rotation.x, camera.rotation.y, camera.rotation.z);
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
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

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Arrows listeners
window.addEventListener('keyup', keyUp);
window.addEventListener('keydown', keyDown);

// Resize listeners
window.addEventListener('resize', onWindowResize, false);

// This way the audio will be loaded after the page is fully loaded
window.onload = init;
