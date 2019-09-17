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

export default class Maze {

    constructor() {
        // Represents the maze's blocks
        this.maze = new Array(42);
        for (var i = 0; i < this.maze.length; i++) {
            this.maze[i] = new Array(41);
        }

        // Represents the walls objects
        this.walls = new THREE.Group();
        // Represents the balls objects
        this.balls = new THREE.Group();
        // Represents the super balls objects
        this.super_balls = new THREE.Group();
        // Represents the floor
        this.floor = new THREE.Mesh();
    }

    createMaze() {
        for (var i = 0; i < this.maze.length; i++) {
            for (var j = 0; j < this.maze[0].length; j++) {
                if (i == 0 || i == this.maze.length-1) {
                    this.maze[i][j] = 1;
                }
    
                if ((j == 0 || j == this.maze[0].length-1) && (i < 17 || i > 27)) {
                    this.maze[i][j] = 1;
                }
    
                if ((i==16 || i == 28 || i == 20 || i == 24) && (j < 8 || j >= 32)) {
                    this.maze[i][j] = 1;
                }
    
                if ((j == 8 || j == 32) && ((i >= 16 && i <= 20) || (i >= 24 && i <= 28))) {
                    this.maze[i][j] = 1;
                }
    
                if (i == 4 && ((j > 3 && j < 17) || j == 20 || (j > 23 && j < 37))) {
                    this.maze[i][j] = 1;
                }
    
                if ((i >= this.maze.length-4) && (j==20)) {
                    this.maze[i][j] = 1;
                }
    
                if ((i == this.maze.length - 6 || i == this.maze.length - 5) && ((j == 20) || (j >= 4 && j <= 8) || (j >= 12 && j <= 16) || (j >= 24 && j <= 28) || (j >= 32 && j <= 36))) {
                    this.maze[i][j] = 1;
                }
    
                if ((i == this.maze.length - 10) && ((j >= 4 && j <= 8) || (j == 12) || (j >= 16 && j <= 24) || (j == 28) || (j >= 32 && j <= 36))) {
                    this.maze[i][j] = 1;
                }
    
                if ((i <= this.maze.length - 11 && i >= this.maze.length - 14) && ((j == 12) || (j == 20) || (j == 28))) {
                    this.maze[i][j] = 1;
                }
    
                if ((i <= this.maze.length - 14 && i >= this.maze.length - 17) && ((j == 12) || (j == 28))) {
                    this.maze[i][j] = 1;
                }
    
                if ((i == this.maze.length - 18) && ((j == 12 || j == 28) || (j > 15 && j < 25))) {
                    this.maze[i][j] = 1;
                }

                if ((i == this.maze.length - 14) && ((j >= 13 && j <= 16) || (j >= 24 && j <= 27))) {
                    this.maze[i][j] = 1;
                }
    
                if ( (i>=5 && i<=7) && (j==12 || j==20 || j==28)) {
                    this.maze[i][j] = 1;
                }
    
                if ( (i==8) && (j<5 || j==8 || j==12 || (j>15 && j<25) || j==28 || j==32 || j>35)) {
                    this.maze[i][j] = 1;
                }
    
                if ( (i>8 && i<12) && (j==8 || j==32)) {
                    this.maze[i][j] = 1;
                }
    
                if ( (i==12) && ((j>3 && j<9) || (j>11 && j<17) || (j==20) || (j>23 && j<29) || (j>31 && j<37)) ) {
                    this.maze[i][j] = 1;
                }
    
                if ( (i>12 && i<16) && j==20) {
                    this.maze[i][j] = 1;
                }
    
                if ( (i==16) && ((j==12 || j==28) || (j>15 && j<25))) {
                    this.maze[i][j] = 1;
                }
    
                if ( (i>16 && i<20) && (j==12 || j==28)) {
                    this.maze[i][j] = 1;
                }
    
                if ( (i==20) && ((j==12 || j==28) || (j>15 && j<25))) {
                    this.maze[i][j] = 1;
                }
    
                if ( (i>20 && i<24) && (j==16 || j==24)) {
                    this.maze[i][j] = 1;
                }
            }
        }
    }

    createBalls() {
        for (var i = 2; i < this.maze.length-6; i += 2) {
            for (var j = 2; j < this.maze[0].length-1; j += 2) {
                if (this.maze[i][j] != 1) {
                    this.maze[i][j] = 2;
                }
            }
        }

        for (var i = this.maze.length-6; i < this.maze.length; i += 3) {
            for (var j = 2; j < this.maze[0].length-1; j += 2) {
                if (this.maze[i][j] != 1) {
                    this.maze[i][j] = 2;
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
            this.maze[no_balls_indices[i][0]][no_balls_indices[i][1]] = 0;
        }

        var super_balls_indices = [[[10], [2]], [[10], [38]]];
        for (var i = 0; i < super_balls_indices.length; i++) {
            this.maze[super_balls_indices[i][0]][super_balls_indices[i][1]] = 3;
        }
    }

    initMaze() {
        this.createMaze()
        this.createBalls()

        this.floor.geometry = new THREE.PlaneGeometry(205, 211, 10, 10);
        this.floor.material = new THREE.MeshPhongMaterial({map:textureFloor});
        this.floor.castShadow = true;
        this.floor.receiveShadow = true;
        this.floor.rotation.x -= Math.PI / 2;
        this.floor.position.x = 100;
        this.floor.position.z = -103;

        for (var i=0; i<this.maze.length; i++) {
            for (var j=0; j<this.maze[0].length; j++) {
                if (this.maze[i][j] == 1) {
                    cube = new THREE.Mesh(unique_cube, unique_cube_material);
                    cube.castShadow = true;
                    cube.receiveShadow = true;
                    cube.position.set(5*j, 25, -5*i);
                    this.walls.add(cube);
                } 
                else if (this.maze[i][j] == 2) {
                    ball = new THREE.Mesh(unique_ball, unique_ball_material);
                    ball.castShadow = true;
                    ball.receiveShadow = true;
                    ball.position.set(5*j, 2, -5*i);
                    this.balls.add(ball);
                }
                else if (this.maze[i][j] == 3) {
                    super_ball = new THREE.Mesh(unique_super_ball, unique_super_ball_material);
                    super_ball.castShadow = true;
                    super_ball.receiveShadow = true;
                    super_ball.position.set(5*j, 2, -5*i);
                    this.super_balls.add(super_ball);
                }
            }
        }

        // Adding some, otherwise, non-aligned balls
        super_ball = new THREE.Mesh(unique_super_ball, unique_super_ball_material);
        super_ball.castShadow = true;
        super_ball.receiveShadow = true;
        super_ball.position.set(190, 2, -182.5);
        this.super_balls.add(super_ball);

        super_ball = new THREE.Mesh(unique_super_ball, unique_super_ball_material);
        super_ball.castShadow = true;
        super_ball.receiveShadow = true;
        super_ball.position.set(10, 2, -182.5);
        this.super_balls.add(super_ball);

        ball = new THREE.Mesh(unique_ball, unique_ball_material);
        ball.castShadow = true;
        ball.receiveShadow = true;
        ball.position.set(50, 2, -182.5);
        this.balls.add(ball);

        ball = new THREE.Mesh(unique_ball, unique_ball_material);
        ball.castShadow = true;
        ball.receiveShadow = true;
        ball.position.set(90, 2, -182.5);
        this.balls.add(ball);

        ball = new THREE.Mesh(unique_ball, unique_ball_material);
        ball.castShadow = true;
        ball.receiveShadow = true;
        ball.position.set(110, 2, -182.5);
        this.balls.add(ball);

        ball = new THREE.Mesh(unique_ball, unique_ball_material);
        ball.castShadow = true;
        ball.receiveShadow = true;
        ball.position.set(150, 2, -182.5);
        this.balls.add(ball);

        var textureTeleport = new THREE.TextureLoader().load("textures/teleport.jpg");
        textureTeleport.wrapS = THREE.RepeatWrapping;
        textureTeleport.wrapT = THREE.RepeatWrapping;

        cube = new THREE.Mesh(
            new THREE.BoxBufferGeometry(1, 50, 15),
            new THREE.MeshBasicMaterial({map:textureTeleport})
        );
        cube.position.set(0, 25, -110);
        cube.name = 'left';
        this.walls.add(cube);

        cube = new THREE.Mesh(
            new THREE.BoxBufferGeometry(1, 50, 15),
            new THREE.MeshBasicMaterial({map:textureTeleport})
        );
        cube.position.set(200, 25, -110);
        cube.name = 'right';
        this.walls.add(cube);
    }
}