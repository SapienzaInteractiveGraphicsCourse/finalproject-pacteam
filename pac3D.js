import Maze from './maze.js';
import Ghost from './ghost.js';

var scene, camera, renderer;
var raycaster;

// audio variables
var audio = new Array(2);
var playPauseBtn, muteBtn, volumeSlider;

// settings button
var settingsBtn, settingsTable, backBtn;
var stopped = false;

var keyboard = {};
var player = {height: 5, speed: 0.15, turn_speed: Math.PI*0.015, wall_distance: 0.5, score: 0.0};

// Pacman variables
var pacman;
var pacman_x_dim = 1.5, pacman_y_dim = 1.5, pacman_z_dim = 1.5;

//Maze
var maze;

var paused = true, settinged = false;

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
    camera.position.set(100, player.height+80, -5);
    camera.lookAt(camera.position.x, camera.position.y, camera.position.z);

    // Create a source of light
    var dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(100, 80, -50);
    scene.add(dirLight);

    // Create ambient light
    var ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    // Create PacMan
    pacman = new THREE.Mesh(
        new THREE.SphereBufferGeometry(1, 32, 32),//, 0, 2*Math.PI, 0, 0.5 * Math.PI/2),
        new THREE.MeshPhongMaterial({color: 0xffff00}),
    );
    scene.add(pacman);

    var ghost = new Ghost();
    ghost.init_ghost(1, 1, 1, 0xf000ff, 1, 0xf2008f, 1, 0xf0f01f, 0.2, 0.2, 0.2, 0xf2008f, new THREE.Vector3(100, player.height, -6));
    scene.add(ghost.ghost);
    console.log(ghost.ghost);
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
            mesh.position.set(camera.position.x-12, camera.position.y+4, camera.position.z-40);
            scene.add(mesh);

            domEvents.addEventListener(mesh, "mouseover", event => {
                mesh.material.color.setHex(0xffffcc);
                $('html,body').css('cursor', 'pointer');
            });

            domEvents.addEventListener(mesh, "click", event => {
                // Hides the buttons
                scene.remove(mesh);
                camera.position.y = player.height;
                paused = false;
                document.getElementById("playpausebtn").style.background = "url(images/pause.png) no-repeat";
                audio[0].play();
            });

            domEvents.addEventListener(mesh, "mouseout", event => {
                mesh.material.color.setHex(0xffff00);
                $('html,body').css('cursor', 'default');
            });
        }
    );

    // Create an instance for the maze
    maze = new Maze();
    maze.initMaze(scene);
    scene.add(maze.floor)
    scene.add(maze.walls);
    scene.add(maze.balls);

    // Start rendering
    animate();
}

function animate() {

    if (paused || settinged) {
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
        return;
    }

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
        var intersects_top_front_right = raycaster.intersectObjects(maze.walls.children);

        raycaster.set(top_front_left_vertex, new THREE.Vector3(
            Math.sin(actual_orientation), 
            0, 
            -Math.cos(actual_orientation)
        ));
        var intersects_top_front_left = raycaster.intersectObjects(maze.walls.children);

        if (intersects_top_front_right.length > 0 && intersects_top_front_right[0].distance < player.wall_distance) {

            if (intersects_top_front_right[0].object.name == 'left') {
                camera.position.x = 195;
            } else if (intersects_top_front_right[0].object.name == 'right') {
                camera.position.x = 5;
            }

        } else if (intersects_top_front_left.length > 0 && intersects_top_front_left[0].distance < player.wall_distance) {

            if (intersects_top_front_right[0].object.name == 'left') {
                camera.position.x = 195;
            } else if (intersects_top_front_right[0].object.name == 'right') {
                camera.position.x = 5;
            }

        } else {
            camera.position.x -= Math.sin(camera.rotation.y) * player.speed;
            camera.position.z -= Math.cos(camera.rotation.y) * player.speed;
        }

        raycaster.set(new THREE.Vector3(pacman.position.x + 1.5*Math.cos(actual_orientation), pacman.position.y-0.5, pacman.position.z - 1.5*Math.sin(actual_orientation)), new THREE.Vector3(Math.sin(actual_orientation), 0, -Math.cos(actual_orientation)));
        var intersects_balls_left = raycaster.intersectObjects(maze.balls.children);

        raycaster.set(new THREE.Vector3(pacman.position.x, pacman.position.y-0.5, pacman.position.z), new THREE.Vector3(Math.sin(actual_orientation), 0, -Math.cos(actual_orientation)));
        var intersects_balls_center = raycaster.intersectObjects(maze.balls.children);

        raycaster.set(new THREE.Vector3(pacman.position.x - 1.5*Math.cos(actual_orientation), pacman.position.y-0.5, pacman.position.z + 1.5*Math.sin(actual_orientation)), new THREE.Vector3(Math.sin(actual_orientation), 0, -Math.cos(actual_orientation)));
        var intersects_balls_right = raycaster.intersectObjects(maze.balls.children);

        if (intersects_balls_left.length > 0 && intersects_balls_left[0].distance < player.wall_distance) {
            maze.balls.remove(intersects_balls_left[0].object);
            audio[1].play();
        }
        else if (intersects_balls_center.length > 0 && intersects_balls_center[0].distance < player.wall_distance) {
            maze.balls.remove(intersects_balls_center[0].object);
            audio[1].play();
        } 
        else if (intersects_balls_right.length > 0 && intersects_balls_right[0].distance < player.wall_distance) {
            maze.balls.remove(intersects_balls_right[0].object);
            audio[1].play();
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
        var intersects_top_back_right = raycaster.intersectObjects(maze.walls.children);

        raycaster.set(top_back_left_vertex, new THREE.Vector3(
            -Math.sin(actual_orientation), 
            0, 
            Math.cos(actual_orientation)
        ));
        var intersects_top_back_left = raycaster.intersectObjects(maze.walls.children);
        
        if (intersects_top_back_right.length > 0 && intersects_top_back_right[0].distance < player.wall_distance) {

            if (intersects_top_back_right[0].object.name == 'left') {
                camera.position.x = 195;
            } else if (intersects_top_back_right[0].object.name == 'right') {
                camera.position.x = 5;
            }

        } else if (intersects_top_back_left.length > 0 && intersects_top_back_left[0].distance < player.wall_distance) {

            if (intersects_top_back_left[0].object.name == 'left') {
                camera.position.x = 195;
            } else if (intersects_top_back_left[0].object.name == 'right') {
                camera.position.x = 5;
            }

        } else {
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
        var intersects_top_front_left = raycaster.intersectObjects(maze.walls.children);

        raycaster.set(top_back_left_vertex, new THREE.Vector3(
            -Math.cos(actual_orientation), 
            0, 
            -Math.sin(actual_orientation)
        ));
        var intersects_top_back_left = raycaster.intersectObjects(maze.walls.children);

        if (intersects_top_front_left.length > 0 && intersects_top_front_left[0].distance < player.wall_distance) {

            if (intersects_top_front_left[0].object.name == 'left') {
                camera.position.x = 195;
            } else if (intersects_top_front_left[0].object.name == 'right') {
                camera.position.x = 5;
            }

        } else if (intersects_top_back_left.length > 0 && intersects_top_back_left[0].distance < player.wall_distance) {

            if (intersects_top_back_left[0].object.name == 'left') {
                camera.position.x = 195;
            } else if (intersects_top_back_left[0].object.name == 'right') {
                camera.position.x = 5;
            }

        } else {
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
        var intersects_top_back_right = raycaster.intersectObjects(maze.walls.children);

        raycaster.set(top_front_right_vertex, new THREE.Vector3(
            Math.cos(actual_orientation), 
            0, 
            Math.sin(actual_orientation)
        ));
        var intersects_top_front_right = raycaster.intersectObjects(maze.walls.children);

        if (intersects_top_back_right.length > 0 && intersects_top_back_right[0].distance < player.wall_distance) {

            if (intersects_top_back_right[0].object.name == 'left') {
                camera.position.x = 195;
            } else if (intersects_top_back_right[0].object.name == 'right') {
                camera.position.x = 5;
            }

        } else if (intersects_top_front_right.length > 0 && intersects_top_front_right[0].distance < player.wall_distance) {

            if (intersects_top_front_right[0].object.name == 'left') {
                camera.position.x = 195;
            } else if (intersects_top_front_right[0].object.name == 'right') {
                camera.position.x = 5;
            }

        } else {
            camera.position.x += Math.sin(camera.rotation.y + Math.PI/2) * player.speed;
            camera.position.z += Math.cos(camera.rotation.y + Math.PI/2) * player.speed;
        }
    }

    if (keyboard[37]) { // left arrow

        var actual_orientation = -camera.rotation.y;

        raycaster.set(pacman.position, new THREE.Vector3(
            -Math.cos(actual_orientation), 
            0, 
            -Math.sin(actual_orientation)
        ));

        var intersections = raycaster.intersectObjects(maze.walls.children);

        if ((intersections.length > 0 && intersections[0].distance > player.wall_distance + 2) || intersections.length == 0) {
            camera.rotation.y += player.turn_speed;
        }

    }

    if (keyboard[39]) { // right arrow

        var actual_orientation = -camera.rotation.y;

        raycaster.set(pacman.position, new THREE.Vector3(
            Math.cos(actual_orientation), 
            0, 
            Math.sin(actual_orientation)
        ));
        var intersections = raycaster.intersectObjects(maze.walls.children);

        if ((intersections.length > 0 && intersections[0].distance > player.wall_distance + 2) || intersections.length == 0) {
            camera.rotation.y -= player.turn_speed;
        }
    }

    if (keyboard[16]) {
        player.speed = 0.4;
        player.wall_distance = 1.5;
    } else {
        player.speed = 0.2;
        player.wall_distance = 0.5;
    }

    // Update pacman position
    pacman.position.set(camera.position.x + Math.cos(camera.rotation.y + Math.PI/2)*2.5, camera.position.y - 2, camera.position.z - Math.sin(camera.rotation.y + Math.PI/2)*2.5);
    pacman.rotation.set(camera.rotation.x, camera.rotation.y, camera.rotation.z);
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

function initAudioPlayer() {
    audio[0] = new Audio();
    audio[1] = new Audio();

    // Specify the source
    audio[0].src = "musics/pacman_remix.mp3";
    audio[1].src = "musics/pacman_eatfruit.wav";
    // The audio is gonna loop over the source
    audio[0].loop = true;
    audio[1].loop = false;
    // Put the audio in pause
    audio[0].pause();
    audio[1].pause();
    // Set the volume
    audio[0].volume = 0.2;
    audio[1].volume = 0.6;
    // Setting speed of playback
    audio[0].playbackRate = 1;
    audio[1].playbackRate = 2;

    playPauseBtn = document.getElementById("playpausebtn");
    muteBtn = document.getElementById("mutebtn");
    volumeSlider = document.getElementById("volumeslider");

    volumeSlider.value = 20;
    
    // Event handling
    playPauseBtn.onclick = () => {
        if (audio[0].paused) {
            audio[0].play();
            playPauseBtn.style.background = "url(images/pause.png) no-repeat";
        } else {
            audio[0].pause();
            playPauseBtn.style.background = "url(images/play.png) no-repeat";
        }
    };

    muteBtn.onclick = () => {
        if (audio[0].muted) {
		    audio[0].muted = false;
            muteBtn.style.background = "url(images/volume-high.png) no-repeat";
	    } else {
		    audio[0].muted = true;
		    muteBtn.style.background = "url(images/muted.png) no-repeat";
	    }
    };

    volumeSlider.oninput = () => {
        audio[0].volume = volumeSlider.value/100;
    };
}

function initSettings() {

    settingsBtn = document.getElementById("settings");
    settingsTable = document.getElementById("container");
    backBtn = document.getElementById("back");

    settingsBtn.onclick = () => {
        settinged = true;
        settingsTable.style.display = 'initial';
        if (!audio[0].paused) {
            audio[0].pause();
            stopped = true;
        }
    }

    backBtn.onclick = () => {
        settingsTable.style.display = 'none';
        if (stopped) {
            audio[0].play();
            stopped = false;
        }
        settinged = false;
    }
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
