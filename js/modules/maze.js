/*

A class to represents a Maze

*/

// Textures
var textureWall = new THREE.TextureLoader().load("textures/grass.png");
textureWall.wrapS = THREE.RepeatWrapping;
textureWall.wrapT = THREE.RepeatWrapping;
textureWall.generateMipmaps = true;
textureWall.repeat.set(1, 10);
var textureFloor = new THREE.TextureLoader().load("textures/dark_sand.jpg");
textureFloor.wrapS = THREE.RepeatWrapping;
textureFloor.wrapT = THREE.RepeatWrapping;
textureFloor.repeat.set(50, 50);

var cube;
const unique_cube = new THREE.BoxBufferGeometry(5, 50, 5);
const unique_cube_material = new THREE.MeshPhongMaterial({map:textureWall});

var ball;
const unique_ball = new THREE.SphereBufferGeometry(0.75, 16, 16);
const unique_ball_material = new THREE.MeshPhongMaterial({color:0xFFFF00});

var super_ball;
const unique_super_ball = new THREE.SphereBufferGeometry(1.5, 16, 16);
const unique_super_ball_material = new THREE.MeshPhongMaterial({color:0xFFD700});


        // Represents the maze's blocks
var maze = new Array(42);
for (var i = 0; i < maze.length; i++) {
    maze[i] = new Array(41);
}

/* for (var i=0; i < maze.length; i++) {
    for (var j=0; j<maze[0].length; j++) maze[i][j] = 0;
} */

// Represents the walls objects
var walls = new THREE.Group();
// Represents the balls objects
var balls = new THREE.Group();
// Represents the super balls objects
var super_balls = new THREE.Group();
// Represents the floor
var floor = new THREE.Mesh();

function createMaze() {
    for (var i = 0; i < maze.length; i++) {
        for (var j = 0; j < maze[0].length; j++) {
            if (i == 0 || i == maze.length-1) {
                maze[i][j] = 1;
            }

            if ((j == 0 || j == maze[0].length-1) && (i < 17 || i > 27)) {
                maze[i][j] = 1;
            }

            if ((i==16 || i == 28 || i == 20 || i == 24) && (j < 8 || j >= 32)) {
                maze[i][j] = 1;
            }

            if ((j == 8 || j == 32) && ((i >= 16 && i <= 20) || (i >= 24 && i <= 28))) {
                maze[i][j] = 1;
            }

            if (i == 4 && ((j > 3 && j < 17) || j == 20 || (j > 23 && j < 37))) {
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

            if ((i <= maze.length - 11 && i >= maze.length - 14) && ((j == 12) || (j == 20) || (j == 28))) {
                maze[i][j] = 1;
            }

            if ((i <= maze.length - 14 && i >= maze.length - 17) && ((j == 12) || (j == 28))) {
                maze[i][j] = 1;
            }

            if ((i == maze.length - 18) && ((j == 12 || j == 28) || (j > 15 && j < 25))) {
                maze[i][j] = 1;
            }

            if ((i == maze.length - 14) && ((j >= 13 && j <= 16) || (j >= 24 && j <= 27))) {
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
};

function createBalls() {
    for (var i = 2; i < maze.length-6; i += 2) {
        for (var j = 2; j < maze[0].length-1; j += 2) {
            if (maze[i][j] != 1) {
                maze[i][j] = 2;
            }
        }
    }

    for (var i = maze.length-6; i < maze.length; i += 3) {
        for (var j = 2; j < maze[0].length-1; j += 2) {
            if (maze[i][j] != 1) {
                maze[i][j] = 2;
            }
        }
    }

    var no_balls_indices = [[[18], [2]], [[18], [4]], [[18], [6]], [[18], [34]], [[18], [36]], [[18], [38]], 
                            [[26], [2]], [[26], [4]], [[26], [6]], [[26], [34]], [[26], [36]], [[26], [38]], 
                            [[22], [12]],
                            [[16], [14]], [[18], [14]], [[20], [14]], [[22], [14]], [[24], [14]], [[26], [14]], 
                            [[26], [16]], [[18], [16]],
                            [[18], [18]], [[22], [18]], [[26], [18]], [[28], [18]],
                            [[18], [20]], [[22], [20]], [[26], [20]], 
                            [[18], [22]], [[22], [22]], [[26], [22]], [[28], [22]], 
                            [[18], [24]], [[26], [24]],
                            [[16], [26]], [[18], [26]], [[20], [26]], [[22], [26]], [[24], [26]], [[26], [26]], 
                            [[22], [28]],
                            [[2], [20]],
                            // super balls
                            [[36], [2]], [[36], [38]], [[10], [2]], [[10], [38]],
                            //disaligned balls
                            [[36], [10]], [[36], [18]], [[36], [22]], [[36], [30]]];


    for (var i = 0; i < no_balls_indices.length; i++) {
        maze[no_balls_indices[i][0]][no_balls_indices[i][1]] = 0;
    }

    var super_balls_indices = [[[10], [2]], [[10], [38]]];
    for (var i = 0; i < super_balls_indices.length; i++) {
        maze[super_balls_indices[i][0]][super_balls_indices[i][1]] = 3;
    }
};

var initMaze = () => {
    createMaze()
    createBalls()

    console.log(maze);

    floor.geometry = new THREE.PlaneGeometry(205, 211, 10, 10);
    floor.material = new THREE.MeshPhongMaterial({map:textureFloor});
    floor.castShadow = true;
    floor.receiveShadow = true;
    floor.rotation.x -= Math.PI / 2;
    floor.position.x = 100;
    floor.position.z = -103;

    for (var i=0; i<maze.length; i++) {
        for (var j=0; j<maze[0].length; j++) {
            if (maze[i][j] == 1) {
                cube = new THREE.Mesh(unique_cube, unique_cube_material);
                cube.castShadow = true;
                cube.receiveShadow = true;
                cube.position.set(5*j, 25, -5*i);
                walls.add(cube);
            } 
            else if (maze[i][j] == 2) {
                ball = new THREE.Mesh(unique_ball, unique_ball_material);
                ball.castShadow = true;
                ball.receiveShadow = true;
                ball.position.set(5*j, 2, -5*i);
                balls.add(ball);
            }
            else if (maze[i][j] == 3) {
                super_ball = new THREE.Mesh(unique_super_ball, unique_super_ball_material);
                super_ball.castShadow = true;
                super_ball.receiveShadow = true;
                super_ball.position.set(5*j, 2, -5*i);
                super_balls.add(super_ball);
            }
        }
    };

    // Adding some, otherwise, non-aligned balls
    super_ball = new THREE.Mesh(unique_super_ball, unique_super_ball_material);
    super_ball.castShadow = true;
    super_ball.receiveShadow = true;
    super_ball.position.set(190, 2, -182.5);
    super_balls.add(super_ball);

    super_ball = new THREE.Mesh(unique_super_ball, unique_super_ball_material);
    super_ball.castShadow = true;
    super_ball.receiveShadow = true;
    super_ball.position.set(10, 2, -182.5);
    super_balls.add(super_ball);

    ball = new THREE.Mesh(unique_ball, unique_ball_material);
    ball.castShadow = true;
    ball.receiveShadow = true;
    ball.position.set(50, 2, -182.5);
    balls.add(ball);

    ball = new THREE.Mesh(unique_ball, unique_ball_material);
    ball.castShadow = true;
    ball.receiveShadow = true;
    ball.position.set(90, 2, -182.5);
    balls.add(ball);

    ball = new THREE.Mesh(unique_ball, unique_ball_material);
    ball.castShadow = true;
    ball.receiveShadow = true;
    ball.position.set(110, 2, -182.5);
    balls.add(ball);

    ball = new THREE.Mesh(unique_ball, unique_ball_material);
    ball.castShadow = true;
    ball.receiveShadow = true;
    ball.position.set(150, 2, -182.5);
    balls.add(ball);

    var textureTeleport = new THREE.TextureLoader().load("textures/teleport.jpg");
    textureTeleport.wrapS = THREE.RepeatWrapping;
    textureTeleport.wrapT = THREE.RepeatWrapping;

    cube = new THREE.Mesh(
        new THREE.BoxBufferGeometry(1, 50, 15),
        new THREE.MeshBasicMaterial({map:textureTeleport})
    );
    cube.position.set(0, 25, -110);
    cube.name = 'left';
    walls.add(cube);

    cube = new THREE.Mesh(
        new THREE.BoxBufferGeometry(1, 50, 15),
        new THREE.MeshBasicMaterial({map:textureTeleport})
    );
    cube.position.set(200, 25, -110);
    cube.name = 'right';
    walls.add(cube);
};

export {
    initMaze,
    maze,
    walls, balls, super_balls, floor
};