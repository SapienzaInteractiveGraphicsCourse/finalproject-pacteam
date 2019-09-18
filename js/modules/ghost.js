import {maze} from './maze.js'
export default class Ghost {
    constructor() {
        this.ghosts;
        this.actual_direction = 'down';
    }

    loadGhost(loader, color) {
        loader.load(
            '3DModels/pacman_ghost.obj', 
    
			(object) => {
                object.scale.set(4, 3, 4);
                
                // Standard spawn location
                object.position.set(100, 3, -130);
			
				object.traverse( (child) => {
					if (child instanceof THREE.Mesh) {
						child.material.color.setHex(color);
					}
                });
                this.ghost = object;
            }
        );
    }

    get_rotation(i, j) {
        var directions = [];
        if (maze[i+2][j] != 1) {
            directions.push('up');
        }

        if (maze[i-2][j] != 1) {
            directions.push('down');
        }

        if (maze[i][j-2] != 1) {
            directions.push('left');
        }

        if (maze[i][j+2] != 1) {
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

        this.ghost.position.x += 0.25*Math.sin(this.ghost.rotation.y);
        this.ghost.position.z += 0.25*Math.cos(this.ghost.rotation.y);
        
        if (-this.ghost.position.z % 10 == 0 && this.ghost.position.x % 10 == 0) {
            this.ghost.rotation.y = this.get_rotation(-this.ghost.position.z/5, this.ghost.position.x/5);
        }
    }
}