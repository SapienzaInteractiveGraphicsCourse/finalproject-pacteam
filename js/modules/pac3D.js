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
const GHOSTS_MAX_NUMBER = [4, 6, 8];
const GHOST_SPAWN_TIME = [15000, 10000, 8000];

var difficulty_level = 1;

var paused = true;
var player = {height: 6, speed: 0.6, turn_speed: Math.PI*0.015, score: 0.0};

// Pacman.pacman variables
var pacman;
var n_ghosts = 0;
var ghosts = [];
var ghosts_objects = [];

var super_pacman = false;
var i;

var score;
var play;

var id_interval;

function init() {

    // Create the scene
    scene = new THREE.Scene();

    // Create the main camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(100, player.height+80, -5);
    
    // Create minimap camera
    cameraOrtho = new THREE.OrthographicCamera(-2.5, 202.5, 207.5, -2.5, -1000, 1000);
    cameraOrtho.up = new THREE.Vector3(0, 0, -1);
	cameraOrtho.lookAt(new THREE.Vector3(0, -1, 0));
    scene.add(cameraOrtho);

    // Create the renderer
    renderer = new THREE.WebGLRenderer({alpha:true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    score = document.getElementById('score');

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
    
    //Create a raycaster instance
    raycaster = new THREE.Raycaster();
    raycaster.far = 2.5;
};

function animate() {

    if (paused || settinged) {
        renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
        return;
    }

    for (var i=0; i < ghosts.length; i++) {
        ghosts[i].moveGhost();
    }

    var new_pacman_position = new THREE.Vector3(pacman.pacman.position.x, pacman.pacman.position.y + 1, pacman.pacman.position.z);

    raycaster.set(new_pacman_position, new THREE.Vector3(
        Math.sin(-camera.rotation.y), 
        0, 
        -Math.cos(-camera.rotation.y)
    ));
    
    var intersects_up = raycaster.intersectObjects(walls.children);
    var intersects_balls_center = raycaster.intersectObjects(balls.children);
    var intersects_up_ghost = raycaster.intersectObjects(ghosts_objects);

    raycaster.set(new_pacman_position, new THREE.Vector3(
        Math.cos(camera.rotation.y + Math.PI/4), 
        0, 
        -Math.sin(camera.rotation.y + Math.PI/4)
    ));
    var intersects_up_right = raycaster.intersectObjects(walls.children);
    var intersects_balls_right = raycaster.intersectObjects(balls.children);
    var intersects_up_right_ghost = raycaster.intersectObjects(ghosts_objects);

    raycaster.set(new_pacman_position, new THREE.Vector3(
        Math.cos(camera.rotation.y + 3*Math.PI/4), 
        0, 
        -Math.sin(camera.rotation.y + 3*Math.PI/4)
    ));
    var intersects_up_left = raycaster.intersectObjects(walls.children);
    var intersects_balls_left = raycaster.intersectObjects(balls.children);
    var intersects_up_left_ghost = raycaster.intersectObjects(ghosts_objects);

    raycaster.set(pacman.pacman.position, new THREE.Vector3(
        -Math.sin(-camera.rotation.y), 
        0, 
        Math.cos(-camera.rotation.y)
    ));
    var intersects_down = raycaster.intersectObjects(walls.children);
    var intersects_down_ghost = raycaster.intersectObjects(ghosts_objects);

    raycaster.set(pacman.pacman.position, new THREE.Vector3(
        Math.cos(camera.rotation.y + 5*Math.PI/4), 
        0, 
        -Math.sin(camera.rotation.y + 5*Math.PI/4)
    ));
    var intersects_down_left = raycaster.intersectObjects(walls.children);
    var intersects_down_left_ghost = raycaster.intersectObjects(ghosts_objects);

    raycaster.set(pacman.pacman.position, new THREE.Vector3(
        Math.cos(camera.rotation.y + 7*Math.PI/4), 
        0, 
        -Math.sin(camera.rotation.y + 7*Math.PI/4)
    ));
    var intersects_down_right = raycaster.intersectObjects(walls.children);
    var intersects_down_right_ghost = raycaster.intersectObjects(ghosts_objects);

    raycaster.set(pacman.pacman.position, new THREE.Vector3(
        -Math.cos(-camera.rotation.y), 
        0, 
        -Math.sin(-camera.rotation.y)
    ));
    var intersects_left = raycaster.intersectObjects(walls.children);
    var intersects_left_ghost = raycaster.intersectObjects(ghosts_objects);

    raycaster.set(pacman.pacman.position, new THREE.Vector3(
        Math.cos(-camera.rotation.y), 
        0, 
        Math.sin(-camera.rotation.y)
    ));
    var intersects_right = raycaster.intersectObjects(walls.children);
    var intersects_right_ghost = raycaster.intersectObjects(ghosts_objects);
    
    // CHECK GHOST COLLISIONS
    if (intersects_up_ghost.length != 0) {
        ghost_interaction(intersects_up_ghost[0].object);
    } else if (intersects_up_right_ghost.length != 0) {
        ghost_interaction(intersects_up_right_ghost[0].object);
    } else if (intersects_up_left_ghost.length != 0) {
        ghost_interaction(intersects_up_left_ghost[0].object);
    } else if (intersects_down_ghost.length != 0) {
        ghost_interaction(intersects_down_ghost[0].object);
    } else if (intersects_down_left_ghost.length != 0) {
        ghost_interaction(intersects_down_left_ghost[0].object);
    } else if (intersects_left_ghost.length != 0) {
        ghost_interaction(intersects_left_ghost[0].object);
    } else if (intersects_right_ghost.length != 0) {
        ghost_interaction(intersects_right_ghost[0].object);
    } else if (intersects_down_right_ghost.length != 0) {
        ghost_interaction(intersects_down_right_ghost[0].object);
    }

    // W key
    if (keyboard[87]) { 
        walls_interactions(intersects_up_left, intersects_up, intersects_up_right, 'W');

        // ball interactions
        if (intersects_balls_left.length > 0) 
            balls_interaction(intersects_balls_left[0].object);  
        else if (intersects_balls_center.length > 0) 
            balls_interaction(intersects_balls_center[0].object);
        else if (intersects_balls_right.length > 0) 
            balls_interaction(intersects_balls_right[0].object);
    }
    // S key
    if (keyboard[83])
        walls_interactions(intersects_down_left, intersects_down, intersects_down_right, 'S');

    // A key
    if (keyboard[65])
        walls_interactions(intersects_up_left, intersects_left, intersects_down_left, 'A');

    // D key
    if (keyboard[68]) 
        walls_interactions(intersects_up_right, intersects_right, intersects_down_right, 'D');

    // left arrow
    if (keyboard[37]) { 
        if ((intersects_up_left == 0))
            camera.rotation.y += player.turn_speed;
    }
    // right arrow
    if (keyboard[39]) { 
        if (intersects_up_right == 0)
            camera.rotation.y -= player.turn_speed;
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
    renderer.setScissor(window.innerWidth-insetWidth-2, window.innerHeight - insetHeight, insetWidth-2, insetHeight);
    renderer.setViewport(window.innerWidth-insetWidth-2, window.innerHeight - insetHeight, insetWidth-2, insetHeight);
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

const loadPlay = (loader) => {
    //Used to add events listenders
    const domEvents = new THREEx.DomEvents(camera, renderer.domElement);

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
                score.style.display = 'initial';
                if (document.getElementById('easy_diff').checked) difficulty_level=0;
                else if (document.getElementById('medium_diff').checked) difficulty_level=1;
                else difficulty_level = 2;

                document.getElementById('easy_diff').disabled = true;
                document.getElementById('medium_diff').disabled = true;
                document.getElementById('hard_diff').disabled = true;
                camera.position.y = player.height;
                paused = false;
                document.getElementById("playpausebtn").style.background = "url(images/pause.png) no-repeat";
                audio[0].play();
                scene.remove(dirLight);
                id_interval = setInterval(spawn, GHOST_SPAWN_TIME[difficulty_level]);
            });
        
            domEvents.addEventListener(play, "mouseout", event => {
                play.material.color.setHex(0xffff00);
                $('html,body').css('cursor', 'default');
            });
        }
    );
}

const loadManager = () => {
    
    // Create manager and loader
    var manager = new THREE.LoadingManager();
    var object_loader = new THREE.OBJLoader(manager);
    var font_loader = new THREE.FontLoader(manager);

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
        loadingOverlay.classList.add('loading-overlay-hidden');

        scene.add(dirLight, ambientLight, spotLight, target_object, play, floor, walls, balls, pacman.pacman);
        document.getElementById('Info').style.display = 'initial';
        animate();
    };

    // Create pacman
    loadPacman(object_loader);

    // Load ghost model
    loadGhost(object_loader, 0xffff00);
    loadGhost(object_loader, 0xffb852);
    loadGhost(object_loader, 0x00ffff);
    loadGhost(object_loader, 0xffb8ff);

    // Load Play
    loadPlay(font_loader);
}

function spawn() {
    if (n_ghosts < GHOSTS_MAX_NUMBER[difficulty_level]) {
        var ghost = new Ghost();
        scene.add(ghost.ghost);
        scene.add(ghost.cube);

        ghosts.push(ghost);
        ghosts_objects.push(ghost.cube);
        n_ghosts++;
    }
}

function ghost_interaction(cube) {
    if (super_pacman) {
        for(i=0; i<ghosts.length; i++) {
            if (ghosts[i].cube == cube) {
                scene.remove(cube);
                scene.remove(ghosts[i].ghost);
                ghosts.splice(i, 1);
                ghosts_objects.splice(i, 1);
                audio[4].play();
                player.score += GHOST_POINTS[difficulty_level];
                score.innerHTML = "Score: " + player.score;
                n_ghosts--;
            }
        }
    } else {
        paused = true;
        audio[0].pause();
        audio[3].play();
        document.getElementById('container_death').style.display = 'initial';
        clearInterval(id_interval);
    }
    
}

function balls_interaction(ball) {
    if (ball.name == 'sp') {
        balls.remove(ball);
        super_pacman = true;
        setTimeout(finish_power_up, SUPER_PACMAN_TIME[difficulty_level]);
        audio[5].play();
        audio[0].pause();
        player.score += FRUIT_POINTS[difficulty_level];
        score.innerHTML = 'Score: ' + player.score;
    } 
    else {
        balls.remove(ball);
        audio[1].play();
        player.score += FRUIT_POINTS[difficulty_level];
        score.innerHTML = 'Score: ' + player.score;
    }

    if (balls.children.length == 0) {
        paused = true;
        document.getElementById('victory').style.display = 'initial';
        clearInterval(id_interval);
    }
}

function finish_power_up() {
    super_pacman = false;
    audio[5].pause();
    audio[0].play();
}

function walls_interactions(intersections_rigth, intersections_center, intersections_left, key) {
    if (intersections_rigth.length != 0) {
        if (intersections_rigth[0].object.name == 'left') {
            camera.position.x = 195;
        } else if (intersections_rigth[0].object.name == 'right') {
            camera.position.x = 5;
        }
    } else if (intersections_center.length != 0) {
        if (intersections_center[0].object.name == 'left') {
            camera.position.x = 195;
        } else if (intersections_center[0].object.name == 'right') {
            camera.position.x = 5;
        }
    } else if (intersections_left.length != 0) {
        if (intersections_left[0].object.name == 'left') {
            camera.position.x = 195;
        } else if (intersections_left[0].object.name == 'right') {
            camera.position.x = 5;
        }
    } else {
        switch (key) {
            case 'W':
                camera.position.x -= Math.sin(camera.rotation.y) * player.speed;
                camera.position.z -= Math.cos(camera.rotation.y) * player.speed;
                break;
            case 'S':
                camera.position.x += Math.sin(camera.rotation.y) * player.speed;
                camera.position.z += Math.cos(camera.rotation.y) * player.speed;
                break;
            case 'A':
                camera.position.x += Math.sin(camera.rotation.y - Math.PI/2) * player.speed;
                camera.position.z += Math.cos(camera.rotation.y - Math.PI/2) * player.speed;
                break;
            case 'D':
                camera.position.x += Math.sin(camera.rotation.y + Math.PI/2) * player.speed;
                camera.position.z += Math.cos(camera.rotation.y + Math.PI/2) * player.speed;
                break;
        }
    }
}

// Resize listeners
window.addEventListener('resize', onWindowResize, false);

window.onload = init();