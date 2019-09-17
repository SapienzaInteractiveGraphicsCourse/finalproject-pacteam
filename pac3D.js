import Maze from './maze.js';
import Ghost from './ghost.js';
import Pacman from './pacman.js';

let scene, camera, cameraOrtho, renderer;
var raycaster;

var insetWidth, insetHeight;

// audio variables
var audio = new Array(6);
var playPauseBtn, muteBtn, volumeSlider;

// settings button
var settingsBtn, settingsTable, backBtn;
var stopped = false, paused = true, settinged = false;

var keyboard = {};
var player = {height: 6, speed: 0.15, turn_speed: Math.PI*0.015, wall_distance: 4, score: 0.0};

// Pacman.pacman variables
var pacman;

// Maze
var maze;

window.onload = function init() {
    // Create the scene
    scene = new THREE.Scene();

    // Create the main camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(100, player.height+80, -5);
    
    // Create minimap camera
    cameraOrtho = new THREE.OrthographicCamera(0, 201, 205, 0, -1000, 1000);
    cameraOrtho.up = new THREE.Vector3(0,0,-1);
	cameraOrtho.lookAt(new THREE.Vector3(0,-1,0));
    scene.add(cameraOrtho);

    // Create the renderer
    renderer = new THREE.WebGLRenderer({alpha:true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    
    // Create a source of light
    var dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(100, 80, -50);
    scene.add(dirLight);

    // Create ambient light
    var ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    var manager = new THREE.LoadingManager();
    var loader = new THREE.OBJLoader(manager);

    pacman = new Pacman();
    pacman.loadPacman(loader);

    var ghost = new Ghost();
    ghost.loadGhost(loader);
    manager.onLoad = () => {
        scene.add(pacman.pacman, ghost.ghost);
    }
    
    //Create a raycaster instance
    raycaster = new THREE.Raycaster();
    raycaster.far = 2.5;
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
                scene.remove(dirLight);
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
    scene.add(maze.super_balls);

    // Start rendering
    onWindowResize();
    animate();
}

function animate() {

    if (paused || settinged) {
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
        return;
    }

    if (keyboard[87]) { // W key
        
        raycaster.set(pacman.pacman.position, new THREE.Vector3(
            Math.cos(camera.rotation.y + Math.PI/4), 
            0, 
            -Math.sin(camera.rotation.y + Math.PI/4)
        ));
        var intersects_right = raycaster.intersectObjects(maze.walls.children);

        raycaster.set(pacman.pacman.position, new THREE.Vector3(
            Math.cos(camera.rotation.y + 3*Math.PI/4), 
            0, 
            -Math.sin(camera.rotation.y + 3*Math.PI/4)
        ));
        var intersects_left = raycaster.intersectObjects(maze.walls.children);

        raycaster.set(pacman.pacman.position, new THREE.Vector3(
            Math.sin(-camera.rotation.y), 
            0, 
            -Math.cos(-camera.rotation.y)
        ));
        var intersects_center = raycaster.intersectObjects(maze.walls.children);
        
        if (intersects_center.length > 0) {
            if (intersects_center[0].object.name == 'left') {
                camera.position.x = 195;
            } else if (intersects_center[0].object.name == 'right') {
                camera.position.x = 5;
            }
        } else if (intersects_left.length > 0) {
            if (intersects_left[0].object.name == 'left') {
                camera.position.x = 195;
            } else if (intersects_left[0].object.name == 'right') {
                camera.position.x = 5;
            }
        } else if (intersects_right.length > 0) {
            if (intersects_right[0].object.name == 'left') {
                camera.position.x = 195;
            } else if (intersects_right[0].object.name == 'right') {
                camera.position.x = 5;
            }
        } else {
            camera.position.x -= Math.sin(camera.rotation.y) * player.speed;
            camera.position.z -= Math.cos(camera.rotation.y) * player.speed;
        }

        raycaster.set(new THREE.Vector3(pacman.pacman.position.x + 1.5*Math.cos(-camera.rotation.y), pacman.pacman.position.y+1, pacman.pacman.position.z - 1.5*Math.sin(-camera.rotation.y)), new THREE.Vector3(Math.sin(-camera.rotation.y), 0, -Math.cos(-camera.rotation.y)));
        var intersects_balls_left = raycaster.intersectObjects(maze.balls.children);

        raycaster.set(new THREE.Vector3(pacman.pacman.position.x, pacman.pacman.position.y+1, pacman.pacman.position.z), new THREE.Vector3(Math.sin(-camera.rotation.y), 0, -Math.cos(-camera.rotation.y)));
        var intersects_balls_center = raycaster.intersectObjects(maze.balls.children);

        raycaster.set(new THREE.Vector3(pacman.pacman.position.x - 1.5*Math.cos(-camera.rotation.y), pacman.pacman.position.y+1, pacman.pacman.position.z + 1.5*Math.sin(-camera.rotation.y)), new THREE.Vector3(Math.sin(-camera.rotation.y), 0, -Math.cos(-camera.rotation.y)));
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

        raycaster.set(pacman.pacman.position, new THREE.Vector3(
            -Math.sin(-camera.rotation.y), 
            0, 
            Math.cos(-camera.rotation.y)
        ));
        var intersects_center = raycaster.intersectObjects(maze.walls.children);
        
        raycaster.set(pacman.pacman.position, new THREE.Vector3(
            Math.cos(camera.rotation.y + 5*Math.PI/4), 
            0, 
            -Math.sin(camera.rotation.y + 5*Math.PI/4)
        ));
        var intersects_right = raycaster.intersectObjects(maze.walls.children);

        raycaster.set(pacman.pacman.position, new THREE.Vector3(
            Math.cos(camera.rotation.y + 7*Math.PI/4), 
            0, 
            -Math.sin(camera.rotation.y + 7*Math.PI/4)
        ));
        var intersects_left = raycaster.intersectObjects(maze.walls.children);
        
        if (intersects_center.length > 0) {
            if (intersects_center[0].object.name == 'left') {
                camera.position.x = 195;
            } else if (intersects_center[0].object.name == 'right') {
                camera.position.x = 5;
            }
        } else if (intersects_left.length > 0) {
            if (intersects_left[0].object.name == 'left') {
                camera.position.x = 195;
            } else if (intersects_left[0].object.name == 'right') {
                camera.position.x = 5;
            }
        } else if (intersects_right.length > 0) {
            if (intersects_right[0].object.name == 'left') {
                camera.position.x = 195;
            } else if (intersects_right[0].object.name == 'right') {
                camera.position.x = 5;
            }
        } else {
            camera.position.x += Math.sin(camera.rotation.y) * player.speed;
            camera.position.z += Math.cos(camera.rotation.y) * player.speed;
        }
    }

    if (keyboard[65]) { // A key

        raycaster.set(pacman.pacman.position, new THREE.Vector3(
            -Math.cos(-camera.rotation.y), 
            0, 
            -Math.sin(-camera.rotation.y)
        ));
        var intersects_center = raycaster.intersectObjects(maze.walls.children);
        scene.add(new THREE.ArrowHelper(raycaster.ray.direction, raycaster.ray.origin, 300, 0xff0000));

        raycaster.set(pacman.pacman.position, new THREE.Vector3(
            Math.cos(camera.rotation.y + 3*Math.PI/4), 
            0, 
            -Math.sin(camera.rotation.y + 3*Math.PI/4)
        ));
        var intersects_right = raycaster.intersectObjects(maze.walls.children);
        scene.add(new THREE.ArrowHelper(raycaster.ray.direction, raycaster.ray.origin, 300, 0xff0000));

        raycaster.set(pacman.pacman.position, new THREE.Vector3(
            Math.cos(camera.rotation.y + 5*Math.PI/4), 
            0, 
            -Math.sin(camera.rotation.y + 5*Math.PI/4)
        ));
        var intersects_left = raycaster.intersectObjects(maze.walls.children);
        scene.add(new THREE.ArrowHelper(raycaster.ray.direction, raycaster.ray.origin, 300, 0xff0000));
        
        if (intersects_center.length > 0) {
            if (intersects_center[0].object.name == 'left') {
                camera.position.x = 195;
            } else if (intersects_center[0].object.name == 'right') {
                camera.position.x = 5;
            }
        } else if (intersects_left.length > 0) {
            if (intersects_left[0].object.name == 'left') {
                camera.position.x = 195;
            } else if (intersects_left[0].object.name == 'right') {
                camera.position.x = 5;
            }
        } else if (intersects_right.length > 0) {
            if (intersects_right[0].object.name == 'left') {
                camera.position.x = 195;
            } else if (intersects_right[0].object.name == 'right') {
                camera.position.x = 5;
            }
        } else {
            camera.position.x += Math.sin(camera.rotation.y - Math.PI/2) * player.speed;
            camera.position.z += Math.cos(camera.rotation.y - Math.PI/2) * player.speed;
        }
    }

    if (keyboard[68]) { // D key

        raycaster.set(pacman.pacman.position, new THREE.Vector3(
            Math.cos(-camera.rotation.y), 
            0, 
            Math.sin(-camera.rotation.y)
        ));
        var intersects_center = raycaster.intersectObjects(maze.walls.children);

        raycaster.set(pacman.pacman.position, new THREE.Vector3(
            Math.cos(camera.rotation.y + 7*Math.PI/4), 
            0, 
            -Math.sin(camera.rotation.y + 7*Math.PI/4)
        ));
        var intersects_right = raycaster.intersectObjects(maze.walls.children);

        raycaster.set(pacman.pacman.position, new THREE.Vector3(
            Math.cos(camera.rotation.y + Math.PI/4), 
            0, 
            -Math.sin(camera.rotation.y + Math.PI/4)
        ));
        var intersects_left = raycaster.intersectObjects(maze.walls.children);

        if (intersects_center.length > 0) {
            if (intersects_center[0].object.name == 'left') {
                camera.position.x = 195;
            } else if (intersects_center[0].object.name == 'right') {
                camera.position.x = 5;
            }
        } else if (intersects_left.length > 0) {
            if (intersects_left[0].object.name == 'left') {
                camera.position.x = 195;
            } else if (intersects_left[0].object.name == 'right') {
                camera.position.x = 5;
            }
        } else if (intersects_right.length > 0) {
            if (intersects_right[0].object.name == 'left') {
                camera.position.x = 195;
            } else if (intersects_right[0].object.name == 'right') {
                camera.position.x = 5;
            }
        } else {
            camera.position.x += Math.sin(camera.rotation.y + Math.PI/2) * player.speed;
            camera.position.z += Math.cos(camera.rotation.y + Math.PI/2) * player.speed;
        }
    }

    if (keyboard[37]) { // left arrow

        raycaster.set(pacman.pacman.position, new THREE.Vector3(
            -Math.cos(-camera.rotation.y), 
            0, 
            -Math.sin(-camera.rotation.y)
        ));

        var intersections = raycaster.intersectObjects(maze.walls.children);

        if ((intersections.length > 0 && intersections[0].distance > player.wall_distance + 2) || intersections.length == 0) {
            camera.rotation.y += player.turn_speed;
        }

    }

    if (keyboard[39]) { // right arrow

        raycaster.set(pacman.pacman.position, new THREE.Vector3(
            Math.cos(-camera.rotation.y), 
            0, 
            Math.sin(-camera.rotation.y)
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
    pacman.pacman.position.set(camera.position.x + Math.cos(camera.rotation.y + Math.PI/2)*3.5, 1, camera.position.z - Math.sin(camera.rotation.y + Math.PI/2)*3.5);
    pacman.pacman.rotation.set(camera.rotation.x, camera.rotation.y - 1.28, camera.rotation.z + 0.21);
    
    renderer.setViewport( 0, 0, window.innerWidth, window.innerHeight );
    renderer.render( scene, camera );
    renderer.clearDepth();
 	renderer.setScissorTest(true);
    renderer.setScissor(window.innerWidth-insetWidth, window.innerHeight - insetHeight, insetWidth, insetHeight);
    renderer.setViewport(window.innerWidth-insetWidth, window.innerHeight - insetHeight, insetWidth, insetHeight);
	renderer.render(scene, cameraOrtho);
    renderer.setScissorTest(false);
    requestAnimationFrame(animate);
}

function initAudioPlayer() {
    audio[0] = new Audio();
    audio[1] = new Audio();
    audio[2] = new Audio();
    audio[3] = new Audio();
    audio[4] = new Audio();
    audio[5] = new Audio();

    // Specify the source
    audio[0].src = "musics/pacman_remix.mp3";
    audio[1].src = "musics/pacman_eatfruit.wav";
    audio[2].src = "musics/pacman_change_volume_ringtone.wav";
    audio[3].src = "musics/pacman_death.wav";
    audio[4].src = "musics/pacman_eatghost.wav";
    audio[5].src = "musics/pacman_chomp.wav";

    // The audio is gonna loop over the source
    audio[0].loop = true;
    audio[1].loop = false;
    audio[2].loop = false;
    audio[3].loop = false;
    audio[4].loop = false;
    audio[5].loop = true;

    // Put the audio in pause
    audio[0].pause();
    audio[1].pause();
    audio[2].pause();
    audio[3].pause();
    audio[4].pause();
    audio[5].pause();

    // Set the volume
    audio[0].volume = 0.2;
    audio[1].volume = 0.2;
    audio[2].volume = 0.2;
    audio[3].volume = 0.2;
    audio[4].volume = 0.2;
    audio[5].volume = 0.2;

    // Setting speed of playback
    audio[0].playbackRate = 1;
    audio[1].playbackRate = 2.75;
    audio[2].playbackRate = 1.15;

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
            audio[1].muted = false;
            audio[3].muted = false;
            audio[4].muted = false;
            audio[5].muted = false;
            muteBtn.style.background = "url(images/volume-high.png) no-repeat";
	    } else {
            audio[0].muted = true;
            audio[1].muted = true;
            audio[3].muted = true;
            audio[4].muted = true;
            audio[5].muted = true;
		    muteBtn.style.background = "url(images/muted.png) no-repeat";
	    }
    };

    volumeSlider.onchange = () => {
        audio[0].volume = volumeSlider.value/100;
        audio[1].volume = volumeSlider.value/100;
        audio[2].volume = volumeSlider.value/100;
        audio[3].volume = volumeSlider.value/100;
        audio[4].volume = volumeSlider.value/100;
        audio[5].volume = volumeSlider.value/100;
        audio[2].play();
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

    insetWidth = window.innerHeight / 3;
    insetHeight = window.innerHeight / 3;

    cameraOrtho.aspect = insetWidth / insetHeight;
    cameraOrtho.updateProjectionMatrix(); 
}

// Arrows listeners
window.addEventListener('keyup', keyUp);
window.addEventListener('keydown', keyDown);

// Resize listeners
window.addEventListener('resize', onWindowResize, false);