import Maze from './maze.js';
import Ghost from './ghost.js';
import Pacman from './pacman.js';
import {AudioInitializer, audio} from './audio.js';
import {Settings, settinged} from './settings.js';
import {keyboard, addKeyboardListeners} from './keyboard_controls.js';

let scene, camera, cameraOrtho, renderer;
var raycaster;

var insetWidth, insetHeight;

var paused = true;
var player = {height: 6, speed: 0.15, turn_speed: Math.PI*0.015, wall_distance: 4, score: 0.0};

// Pacman.pacman variables
var pacman;

// Maze
var maze;

var spotLight;
var target_object;

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
    var ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);
    
    var manager = new THREE.LoadingManager();
    var loader = new THREE.OBJLoader(manager);

    pacman = new Pacman();
    pacman.loadPacman(loader);

    var ghost = new Ghost();
    ghost.loadGhost(loader);
    
    //Create a raycaster instance
    raycaster = new THREE.Raycaster();
    raycaster.far = 2.5;
    // Set the settings
    Settings();
    // Set the audio
    AudioInitializer();

    //Used to add events listenders
    const domEvents = new THREEx.DomEvents(camera, renderer.domElement);

    var loader = new THREE.FontLoader();
    var play;
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
            });

            domEvents.addEventListener(play, "mouseout", event => {
                play.material.color.setHex(0xffff00);
                $('html,body').css('cursor', 'default');
            });
        }
    );

    spotLight = new THREE.SpotLight(0xffffff, 0.9, 200, Math.PI/4, 1, 2);
    spotLight.castShadow = true;
    scene.add(spotLight);
    target_object = new THREE.Object3D();
    target_object.position.set(100, player.height, -10);
    scene.add(target_object);
    spotLight.target = target_object;
    

    // Create an instance for the maze
    maze = new Maze();
    maze.initMaze(scene);
    manager.onLoad = () => {
        scene.add(
            play, 
            pacman.pacman, 
            ghost.ghost,
            maze.floor,
            maze.walls,
            maze.balls,
            maze.super_balls);
    };

    // Start rendering
    onWindowResize();
    addKeyboardListeners();
    animate();
};

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

        raycaster.set(pacman.pacman.position, new THREE.Vector3(
            Math.cos(camera.rotation.y + 3*Math.PI/4), 
            0, 
            -Math.sin(camera.rotation.y + 3*Math.PI/4)
        ));
        var intersects_right = raycaster.intersectObjects(maze.walls.children);

        raycaster.set(pacman.pacman.position, new THREE.Vector3(
            Math.cos(camera.rotation.y + 5*Math.PI/4), 
            0, 
            -Math.sin(camera.rotation.y + 5*Math.PI/4)
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
    pacman.pacman.position.set(camera.position.x + Math.sin(-camera.rotation.y)*3.5, 1, camera.position.z - Math.cos(-camera.rotation.y)*3.5);
    pacman.pacman.rotation.set(camera.rotation.x, camera.rotation.y - 1.28, camera.rotation.z + 0.21);
    target_object.position.set(camera.position.x + Math.sin(-camera.rotation.y)*10, 1, camera.position.z - Math.cos(-camera.rotation.y)*10);
    spotLight.position.set(camera.position.x, camera.position.y, camera.position.z);
    
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

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

    insetWidth = window.innerHeight / 3;
    insetHeight = window.innerHeight / 3;

    cameraOrtho.aspect = insetWidth / insetHeight;
    cameraOrtho.updateProjectionMatrix(); 
}


// Resize listeners
window.addEventListener('resize', onWindowResize, false);