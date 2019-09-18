import {audioInitializer, audio} from './audio.js';
import {settingsInitializer, settinged} from './settings.js';
import {keyboard, addKeyboardListeners} from './keyboard_controls.js';


import {Ghost, loadGhost} from './ghost.js';
import {Pacman, loadPacman} from './pacman.js';
import {initMaze, walls, balls, floor} from './maze.js';
import {spotLight, target_object, dirLight, ambientLight} from './lights.js';

let scene, camera, cameraOrtho, renderer, raycaster;

var insetWidth, insetHeight;

const FRUIT_POINTS = [2, 5, 10] , GHOST_POINTS = [20, 50, 100];
const SUPER_PACMAN_TIME = [20000, 15000, 10000];
const GHOSTS_MAX_NUMBER = [3, 4, 5];
const GHOSTS_MAX_NUMBER_PINK = [3, 2, 1],
      GHOSTS_MAX_NUMBER_BLUE = [2, 2, 1],
      GHOSTS_MAX_NUMBER_ORANGE = [1, 2, 3],
      GHOSTS_MAX_NUMBER_RED = [1, 2, 3];
const GHOST_RATE_PINK = [0.6, 0.3, 0.1],
      GHOST_RATE_BLUE = [0.5, 0.4, 0.2],
      GHOST_RATE_ORANGE = [0.2, 0.4, 0.5],
      GHOST_RATE_RED = [0.1, 0.3, 0.6];
const GHOST_SPAWN_TIME = [10000, 20000, 30000],
      FIRST_GHOST_SPAWN_TIME = [12000, 8000, 4000];

const GHOST_TYPE_RED = "red",
      GHOST_TYPE_ORANGE = "orange",
      GHOST_TYPE_BLUE = "blue",
      GHOST_TYPE_PINK = "pink";

const GHOST_COLOR_RED = 0xffff00,
      GHOST_COLOR_ORANGE = 0xffb852,
      GHOST_COLOR_BLUE = 0x00ffff,
      GHOST_COLOR_PINK = 0xffb8ff;


var difficulty_level = 1;

var paused = true;
var player = {height: 6, speed: 0.25, turn_speed: Math.PI*0.015, score: 0.0};

// Pacman.pacman variables
var pacman;
var ghosts = [];

var super_pacman = false;

var manager;
var object_loader;

function finish_power_up() {
    super_pacman = false;
    audio[5].pause();
    audio[0].play();
}

var id_interval;
var play;

window.onload = function init() {

    // Create the scene
    scene = new THREE.Scene();

    // Create the main camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(100, player.height+80, -5);
    
    // Create minimap camera
    cameraOrtho = new THREE.OrthographicCamera(0, 201, 205, 0, -1000, 1000);
    cameraOrtho.up = new THREE.Vector3(0, 0, -1);
	cameraOrtho.lookAt(new THREE.Vector3(0, -1, 0));
    scene.add(cameraOrtho);

    // Create the renderer
    renderer = new THREE.WebGLRenderer({alpha:true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Initialize the manager
    loadManager();

    // Add setting and audio
    settingsInitializer();
    audioInitializer();

    // Useful stuffs
    onWindowResize();
    addKeyboardListeners();

    // Create an instance for the maze
    initMaze();
    
    // Create manager and loader
    object_loader = new THREE.OBJLoader(manager);

    // Create pacman
    loadPacman(object_loader);
    
    // Load ghost model
    loadGhost(object_loader);

    // Load Play
    loadPlay();
    
    //Create a raycaster instance
    raycaster = new THREE.Raycaster();
    raycaster.far = 2.5;
};

function animate() {

    if (paused || settinged) {
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
        return;
    }

    for (var i=0; i < ghosts.length; i++) {
        ghosts[i].moveGhost();
    }

    if (keyboard[87]) { // W key

        var new_pacman_position = new THREE.Vector3(pacman.pacman.position.x, pacman.pacman.position.y + 1, pacman.pacman.position.z);
        
        raycaster.set(new_pacman_position, new THREE.Vector3(
            Math.cos(camera.rotation.y + Math.PI/4), 
            0, 
            -Math.sin(camera.rotation.y + Math.PI/4)
        ));
        var intersects_right = raycaster.intersectObjects(walls.children);
        var intersects_balls_right = raycaster.intersectObjects(balls.children);

        raycaster.set(new_pacman_position, new THREE.Vector3(
            Math.cos(camera.rotation.y + 3*Math.PI/4), 
            0, 
            -Math.sin(camera.rotation.y + 3*Math.PI/4)
        ));
        var intersects_left = raycaster.intersectObjects(walls.children);
        var intersects_balls_left = raycaster.intersectObjects(balls.children);

        raycaster.set(new_pacman_position, new THREE.Vector3(
            Math.sin(-camera.rotation.y), 
            0, 
            -Math.cos(-camera.rotation.y)
        ));
        var intersects_center = raycaster.intersectObjects(walls.children);
        var intersects_balls_center = raycaster.intersectObjects(balls.children);
        
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

        // ball interactions
        if (intersects_balls_left.length > 0) {
            if (intersects_balls_left[0].object.name == 'sp') {
                balls.remove(intersects_balls_left[0].object);
                super_pacman = true;
                setTimeout(finish_power_up, SUPER_PACMAN_TIME[difficulty_level]);
                audio[5].play();
                audio[0].pause();
                player.score += FRUIT_POINTS[difficulty_level];
            } 
            else {
                balls.remove(intersects_balls_left[0].object);
                audio[1].play();
                player.score += FRUIT_POINTS[difficulty_level];
            }
        }
        else if (intersects_balls_center.length > 0) {
            if (intersects_balls_center[0].object.name == 'sp') {
                balls.remove(intersects_balls_center[0].object);
                super_pacman = true;
                setTimeout(finish_power_up, SUPER_PACMAN_TIME[difficulty_level]);
                audio[5].play();
                audio[0].pause();
                player.score += FRUIT_POINTS[difficulty_level];
            } 
            else {
                balls.remove(intersects_balls_center[0].object);
                audio[1].play();
                player.score += FRUIT_POINTS[difficulty_level];
            }
        } 
        else if (intersects_balls_right.length > 0) {
            if (intersects_balls_right[0].object.name == 'sp') {
                balls.remove(intersects_balls_right[0].object);
                super_pacman = true;
                setTimeout(finish_power_up, SUPER_PACMAN_TIME[difficulty_level]);
                audio[5].play();
                audio[0].pause();
                player.score += FRUIT_POINTS[difficulty_level];
            } 
            else {
                balls.remove(intersects_balls_right[0].object);
                audio[1].play();
                player.score += FRUIT_POINTS[difficulty_level];
            }
        }
    }

    if (keyboard[83]) { // S key

        raycaster.set(pacman.pacman.position, new THREE.Vector3(
            -Math.sin(-camera.rotation.y), 
            0, 
            Math.cos(-camera.rotation.y)
        ));
        var intersects_center = raycaster.intersectObjects(walls.children);
        
        raycaster.set(pacman.pacman.position, new THREE.Vector3(
            Math.cos(camera.rotation.y + 5*Math.PI/4), 
            0, 
            -Math.sin(camera.rotation.y + 5*Math.PI/4)
        ));
        var intersects_right = raycaster.intersectObjects(walls.children);

        raycaster.set(pacman.pacman.position, new THREE.Vector3(
            Math.cos(camera.rotation.y + 7*Math.PI/4), 
            0, 
            -Math.sin(camera.rotation.y + 7*Math.PI/4)
        ));
        var intersects_left = raycaster.intersectObjects(walls.children);
        
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
        var intersects_center = raycaster.intersectObjects(walls.children);

        raycaster.set(pacman.pacman.position, new THREE.Vector3(
            Math.cos(camera.rotation.y + 3*Math.PI/4), 
            0, 
            -Math.sin(camera.rotation.y + 3*Math.PI/4)
        ));
        var intersects_right = raycaster.intersectObjects(walls.children);

        raycaster.set(pacman.pacman.position, new THREE.Vector3(
            Math.cos(camera.rotation.y + 5*Math.PI/4), 
            0, 
            -Math.sin(camera.rotation.y + 5*Math.PI/4)
        ));
        var intersects_left = raycaster.intersectObjects(walls.children);

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
        var intersects_center = raycaster.intersectObjects(walls.children);

        raycaster.set(pacman.pacman.position, new THREE.Vector3(
            Math.cos(camera.rotation.y + 7*Math.PI/4), 
            0, 
            -Math.sin(camera.rotation.y + 7*Math.PI/4)
        ));
        var intersects_right = raycaster.intersectObjects(walls.children);

        raycaster.set(pacman.pacman.position, new THREE.Vector3(
            Math.cos(camera.rotation.y + Math.PI/4), 
            0, 
            -Math.sin(camera.rotation.y + Math.PI/4)
        ));
        var intersects_left = raycaster.intersectObjects(walls.children);

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

        var intersections = raycaster.intersectObjects(walls.children);

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
        var intersections = raycaster.intersectObjects(walls.children);

        if ((intersections.length > 0 && intersections[0].distance > player.wall_distance + 2) || intersections.length == 0) {
            camera.rotation.y -= player.turn_speed;
        }
    }

    // Update pacman position
    pacman.pacman.position.set(camera.position.x + Math.sin(-camera.rotation.y)*3.5, 1, camera.position.z - Math.cos(-camera.rotation.y)*3.5);
    pacman.pacman.rotation.set(camera.rotation.x, camera.rotation.y - 1.28, camera.rotation.z + 0.21);
    target_object.position.set(camera.position.x + Math.sin(-camera.rotation.y)*10, 1, camera.position.z - Math.cos(-camera.rotation.y)*10);
    spotLight.position.set(camera.position.x, camera.position.y, camera.position.z);

    renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);
    renderer.clearDepth();
 	renderer.setScissorTest(true);
    renderer.setScissor(window.innerWidth-insetWidth, window.innerHeight - insetHeight, insetWidth, insetHeight);
    renderer.setViewport(window.innerWidth-insetWidth, window.innerHeight - insetHeight, insetWidth, insetHeight);
	renderer.render(scene, cameraOrtho);
    renderer.setScissorTest(false);
    requestAnimationFrame(animate);
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

function spawn() {
    var ghost = new Ghost(0xffffff);
    scene.add(ghost.ghost);
    ghosts.push(ghost);

    if (ghosts.length == GHOSTS_MAX_NUMBER[difficulty_level]) {
        console.log(GHOSTS_MAX_NUMBER[difficulty_level]);
        clearInterval(id_interval);
    }
}

const loadPlay = () => {
    //Used to add events listenders
    const domEvents = new THREEx.DomEvents(camera, renderer.domElement);

    var loader = new THREE.FontLoader(manager);
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
            play = new THREE.Mesh(text, textMaterial);
            play.position.set(camera.position.x-12, camera.position.y+4, camera.position.z-40);

            domEvents.addEventListener(play, "mouseover", event => {
                play.material.color.setHex(0xffffcc);
                $('html,body').css('cursor', 'pointer');
            });
        
            domEvents.addEventListener(play, "click", event => {
                // Hides the buttons
                scene.remove(play);
                camera.position.y = player.height;
                paused = false;
                document.getElementById("playpausebtn").style.background = "url(images/pause.png) no-repeat";
                audio[0].play();
                scene.remove(dirLight);
                id_interval = setInterval(spawn, 3000);
            });
        
            domEvents.addEventListener(play, "mouseout", event => {
                play.material.color.setHex(0xffff00);
                $('html,body').css('cursor', 'default');
            });
        }
    );
}

const loadManager = () => {
    manager = new THREE.LoadingManager();
    const loadingBar = document.querySelector('#loading-bar');
    const progressBar = document.querySelector('#progress');
    const loadingOverlay = document.querySelector('#loading-overlay');

    manager.onStart = () => {
        loadingBar.style.display = 'inline-flex';
        progressBar.style.display = 'initial';
    };

    manager.onProgress = (item, loaded, total) => {
        progressBar.style.width = (loaded / total * 100) + '%';
    }

    manager.onLoad = () => {
        pacman = new Pacman();
        loadingOverlay.classList.add( 'loading-overlay-hidden' );

        scene.add(dirLight, ambientLight, spotLight, target_object, play, floor, walls, balls, pacman.pacman);
        animate();
    };
}

// Resize listeners
window.addEventListener('resize', onWindowResize, false);