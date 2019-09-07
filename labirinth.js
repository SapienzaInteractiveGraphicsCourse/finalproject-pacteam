/*

A class to represents a Labirinth

*/

export default class Labirinth {

    constructor() {
        //Represents the maze's blocks
        this.maze = new Array(42);
        for (var i = 0; i < this.maze.length; i++) {
            this.maze[i] = new Array(41);
        }

        //Represents the balls into the this.maze
        this.balls = [];
    }

    createMaze() {
        for (var i=0; i < this.maze.length; i++) {
            for (var j=0; j < this.maze[0].length; j++) {
                if (i == 0 || i == this.maze.length-1) {
                    this.maze[i][j] = 1;
                }
    
                if ( (j == 0 || j==this.maze[0].length-1) && (i < 17 || i > 27) ) {
                    this.maze[i][j] = 1;
                }
    
                if ( (i==16 || i== 28 || i==20 || i==24) && (j<8 || j>=32) ) {
                    this.maze[i][j] = 1;
                }
    
                if ( (j==8 || j==32) && ( (i>=16 && i<=20) || (i>=24 && i<=28) ) ) {
                    this.maze[i][j] = 1;
                }
    
                if (i == 4 && ( (j>3 && j<17) || j==20 || (j > 23 && j < 37) )) {
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
    
                if ((i <= this.maze.length - 11 && i >= this.maze.length - 14) && ((j == 12) || (j == 20) ||   (j == 28))) {
                    this.maze[i][j] = 1;
                }
    
                if ((i <= this.maze.length - 14 && i >= this.maze.length - 17) && ((j == 12) || (j == 28))) {
                    this.maze[i][j] = 1;
                }
    
                if ( (i == this.maze.length - 18) && ((j==12 || j==28) || (j>15 && j<25))) {
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
        for (var i=2; i<this.maze.length - 6; i+=2) {
            for (var j=2; j<this.maze[0].length; j+=2) {
                if (this.maze[i][j] != 1) {
                    this.maze[i][j] = 2;
                }
            }
        }

        for (var i=this.maze.length-6; i<this.maze.length; i+=3) {
            for (var j=2; j<this.maze[0].length; j+=2) {
                if (this.maze[i][j] != 1) {
                    this.maze[i][j] = 2;
                }
            }
        }
    }


}