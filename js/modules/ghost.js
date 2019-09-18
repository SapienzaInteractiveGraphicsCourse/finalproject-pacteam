import {maze} from './maze.js'

var possible_ghosts_positions = [new THREE.Vector3(70, 3, -130), new THREE.Vector3(130, 3, -130), new THREE.Vector3(70, 3, -90), new THREE.Vector3(130, 3, -90)];
var ghost_model;
var ghosts = [];
var n_ghosts = 0;

class Ghost {
    constructor(color) {
        this.ghost = ghost_model.clone();
        this.actual_direction = 'down';

        var position = possible_ghosts_positions[Math.floor(Math.random() * possible_ghosts_positions.length)];
        this.ghost.position.set(position.x, position.y, position.z);

        this.ghost.traverse( (child) => {
            if (child instanceof THREE.Mesh) {
                child.material.color.setHex(color);
            }
        });
    }

    get_rotation(i, j) {
        var directions = [];
        if (maze[i+2][j] != 1 && i != 34) {
            directions.push('up');
        }

        if (maze[i-2][j] != 1) {
            directions.push('down');
        }

        if (maze[i][j-2] != 1 && j != 10) {
            directions.push('left');
        }

        if (maze[i][j+2] != 1 && j != 30) {
            directions.push('right');
        }

        if (directions.length == 2 && directions.includes(this.actual_direction)) return this.ghost.rotation.y;
        
        switch (directions[Math.floor(Math.random() * directions.length)]) {
            case 'up':
                this.actual_direction = 'up';
                return Math.PI;
            case 'down':
                this.actual_direction = 'down';
                return 0;
            case 'left': 
                this.actual_direction = 'left';
                return -Math.PI/2;
            case 'right':
                this.actual_direction = 'right';
                return Math.PI/2;
        }
    }

    moveGhost() {

        if (-this.ghost.position.z % 10 == 0 && this.ghost.position.x % 10 == 0) {
            this.ghost.rotation.y = this.get_rotation(-this.ghost.position.z/5, this.ghost.position.x/5);
        }

        this.ghost.position.x += 0.25*Math.sin(this.ghost.rotation.y);
        this.ghost.position.z += 0.25*Math.cos(this.ghost.rotation.y);
    }
}

function loadGhost(loader, color) {
    loader.load(
        '3DModels/pacman_ghost.obj', 

        (object) => {
            object.scale.set(4, 3, 4);
            ghost_model = object;
        }
    );
}


export {
    Ghost,
    loadGhost,
    possible_ghosts_positions,
    ghost_model
}