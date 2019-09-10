import Maze from './maze.js';

var scene, camera, renderer;
var raycaster;

// audio variables
var audio, playPauseBtn, muteBtn, volumeSlider;

// settings button
var settingsBtn;

var keyboard = {};
var player = {height: 5, speed: 0.2, turn_speed: Math.PI*0.02, wall_distance: 0.3, score: 0.0};

// Pacman variables
var pacman;
var pacman_x_dim = 1, pacman_y_dim = 1, pacman_z_dim = 1;

//Maze
var maze;

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

    // Create a source of light
    var dirLight = new THREE.DirectionalLight();
    dirLight.position.set(50, 100, -50);
    scene.add(dirLight);

    // Create ambient light
    var ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    // Create PacMan
    pacman = new THREE.Mesh(
        new THREE.BoxGeometry(pacman_x_dim, pacman_y_dim, pacman_z_dim),
        new THREE.MeshBasicMaterial({color: 0x00ff00, wireframe:false}),
    );
    pacman.position.set(10, player.height, -10);
    scene.add(pacman);
    
    //Create a raycaster instance
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

    // Create an instance for the maze
    maze = new Maze();
    maze.initMaze(scene);

    animate();
}

function animate() {

    if (keyboard[87]) { // W key

        var actual_orientation = -camera.rotation.y;

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
        var intersects_top_front_right = raycaster.intersectObjects(maze.walls);

        raycaster.set(top_front_left_vertex, new THREE.Vector3(
            Math.sin(actual_orientation), 
            0, 
            -Math.cos(actual_orientation)
        ));
        var intersects_top_front_left = raycaster.intersectObjects(maze.walls);

        if (((intersects_top_front_right.length > 0 && intersects_top_front_right[0].distance > player.wall_distance) || intersects_top_front_right.length == 0) && 
            ((intersects_top_front_left.length > 0 && intersects_top_front_left[0].distance > player.wall_distance) || intersects_top_front_left.length == 0)) {
            camera.position.x -= Math.sin(camera.rotation.y) * player.speed;
            camera.position.z -= Math.cos(camera.rotation.y) * player.speed;
        }

        raycaster.set(new THREE.Vector3(pacman.position.x + 1.5*Math.cos(actual_orientation), pacman.position.y - 2, pacman.position.z - 1.5*Math.sin(actual_orientation)), new THREE.Vector3(Math.sin(actual_orientation), 0, -Math.cos(actual_orientation)));
        var intersects_balls_left = raycaster.intersectObjects(maze.balls);

        raycaster.set(new THREE.Vector3(pacman.position.x, pacman.position.y - 2, pacman.position.z), new THREE.Vector3(Math.sin(actual_orientation), 0, -Math.cos(actual_orientation)));
        var intersects_balls_center = raycaster.intersectObjects(maze.balls);

        raycaster.set(new THREE.Vector3(pacman.position.x - 1.5*Math.cos(actual_orientation), pacman.position.y - 2, pacman.position.z + 1.5*Math.sin(actual_orientation)), new THREE.Vector3(Math.sin(actual_orientation), 0, -Math.cos(actual_orientation)));
        var intersects_balls_right = raycaster.intersectObjects(maze.balls);

        if (intersects_balls_left.length > 0 && intersects_balls_left[0].distance < player.wall_distance) {
            scene.remove(intersects_balls_left[0].object);
        }
        else if (intersects_balls_center.length > 0 && intersects_balls_center[0].distance < player.wall_distance) {
            scene.remove(intersects_balls_center[0].object);
        } 
        else if (intersects_balls_right.length > 0 && intersects_balls_right[0].distance < player.wall_distance) {
            scene.remove(intersects_balls_right[0].object);
        }
    }

    if (keyboard[83]) { // S key

        var actual_orientation = -camera.rotation.y;

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
        var intersects_top_back_right = raycaster.intersectObjects(maze.walls);

        raycaster.set(top_back_left_vertex, new THREE.Vector3(
            -Math.sin(actual_orientation), 
            0, 
            Math.cos(actual_orientation)
        ));
        var intersects_top_back_left = raycaster.intersectObjects(maze.walls);

        if (((intersects_top_back_right.length > 0 && intersects_top_back_right[0].distance > player.wall_distance) || intersects_top_back_right.length == 0) && 
            ((intersects_top_back_left.length > 0 && intersects_top_back_left[0].distance > player.wall_distance) || intersects_top_back_left.length == 0)) {
            camera.position.x += Math.sin(camera.rotation.y) * player.speed;
            camera.position.z += Math.cos(camera.rotation.y) * player.speed;
        }
    }

    if (keyboard[65]) { // A key

        var actual_orientation = -camera.rotation.y;

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
        var intersects_top_front_left = raycaster.intersectObjects(maze.walls);

        raycaster.set(top_back_left_vertex, new THREE.Vector3(
            -Math.cos(actual_orientation), 
            0, 
            -Math.sin(actual_orientation)
        ));
        var intersects_top_back_left = raycaster.intersectObjects(maze.walls);

        if (((intersects_top_front_left.length > 0 && intersects_top_front_left[0].distance > player.wall_distance) || intersects_top_front_left.length == 0) && 
            ((intersects_top_back_left.length > 0 && intersects_top_back_left[0].distance > player.wall_distance) || intersects_top_back_left.length == 0)) {
            camera.position.x += Math.sin(camera.rotation.y - Math.PI/2) * player.speed;
            camera.position.z += Math.cos(camera.rotation.y - Math.PI/2) * player.speed;
        }
    }

    if (keyboard[68]) { // D key

        var actual_orientation = -camera.rotation.y;

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
        var intersects_top_back_right = raycaster.intersectObjects(maze.walls);

        raycaster.set(top_front_right_vertex, new THREE.Vector3(
            Math.cos(actual_orientation), 
            0, 
            Math.sin(actual_orientation)
        ));
        var intersects_top_front_right = raycaster.intersectObjects(maze.walls);

        if (((intersects_top_front_right.length > 0 && intersects_top_front_right[0].distance > player.wall_distance) || intersects_top_front_right.length == 0) && 
            ((intersects_top_back_right.length > 0 && intersects_top_back_right[0].distance > player.wall_distance) || intersects_top_back_right.length == 0)) {
            camera.position.x += Math.sin(camera.rotation.y + Math.PI/2) * player.speed;
            camera.position.z += Math.cos(camera.rotation.y + Math.PI/2) * player.speed;
        }
    }

    if (keyboard[37]) { // left arrow

        var actual_orientation = -camera.rotation.y;

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
        var intersects_top_front_right = raycaster.intersectObjects(maze.walls);

        raycaster.set(top_front_left_vertex, new THREE.Vector3(
            -Math.cos(actual_orientation), 
            0, 
            -Math.sin(actual_orientation)
        ));
        var intersects_top_front_left = raycaster.intersectObjects(maze.walls);


        if (((intersects_top_front_right.length > 0 && intersects_top_front_right[0].distance > player.wall_distance) || intersects_top_front_right.length == 0) &&
            ((intersects_top_front_left.length > 0 && intersects_top_front_left[0].distance > player.wall_distance) || intersects_top_front_left.length == 0)) {
            camera.rotation.y += player.turn_speed;
        }
    }

    if (keyboard[39]) { // right arrow

        var actual_orientation = -camera.rotation.y;

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
        var intersects_top_front_right = raycaster.intersectObjects(maze.walls);

        raycaster.set(top_front_left_vertex, new THREE.Vector3(
            -Math.cos(actual_orientation), 
            0, 
            -Math.sin(actual_orientation)
        ));
        var intersects_top_front_left = raycaster.intersectObjects(maze.walls);

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

    // Update pacman position
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
    playPauseBtn.onclick = () => {
        if (audio.paused) {
            audio.play();
            playPauseBtn.style.background = "url(images/pause.png) no-repeat";
        } else {
            audio.pause();
            playPauseBtn.style.background = "url(images/play.png) no-repeat";
        }
    };

    muteBtn.onclick = () => {
        if (audio.muted) {
		    audio.muted = false;
            muteBtn.style.background = "url(images/volume-high.png) no-repeat";
	    } else {
		    audio.muted = true;
		    muteBtn.style.background = "url(images/muted.png) no-repeat";
	    }
    };

    volumeSlider.oninput = () => {
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
