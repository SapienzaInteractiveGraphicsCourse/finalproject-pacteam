import {maze} from './maze.js'

const POSSIBLE_GHOST_POSITIONS = [new THREE.Vector3(70, 3, -130), new THREE.Vector3(130, 3, -130), new THREE.Vector3(70, 3, -90), new THREE.Vector3(130, 3, -90)];

const GHOST_MODELS = [];


class Ghost {
    constructor() {
        this.ghost = GHOST_MODELS[Math.floor(Math.random() * GHOST_MODELS.length)].clone();
        
        this.actual_direction = 'down';
        this.cube = new THREE.Mesh(
            new THREE.BoxBufferGeometry(6, 6, 6),
            new THREE.MeshPhongMaterial()
        );
        this.cube.material.opacity = 0;
        this.cube.material.transparent = true;

        this.sphere_speed = Math.PI/80;
        this.current_angle = 0;
        this.radius = 1.5;


        var sphere1 = new THREE.Mesh(
            new THREE.SphereBufferGeometry(0.1, 32, 32),
            new THREE.MeshPhongMaterial(0xffffff)
        );

        var sphere2 = new THREE.Mesh(
            new THREE.SphereBufferGeometry(0.1, 32, 32),
            new THREE.MeshPhongMaterial(0xffffff)
        );

        var sphere3 = new THREE.Mesh(
            new THREE.SphereBufferGeometry(0.1, 32, 32),
            new THREE.MeshPhongMaterial(0xffffff)
        );

        var sphere4 = new THREE.Mesh(
            new THREE.SphereBufferGeometry(0.1, 32, 32),
            new THREE.MeshPhongMaterial(0xffffff)
        );

        sphere1.position.x += this.radius;
        sphere2.position.x += this.radius;
        sphere3.position.x -= this.radius;
        sphere4.position.x -= this.radius;

        sphere1.position.z += this.radius;
        sphere2.position.z -= this.radius;
        sphere3.position.z += this.radius;
        sphere4.position.z -= this.radius;

        sphere1.name = 'sphere1';
        sphere2.name = 'sphere2';
        sphere3.name = 'sphere3';
        sphere4.name = 'sphere4';

        this.ghost.add(sphere1);
        this.ghost.add(sphere2);
        this.ghost.add(sphere3);
        this.ghost.add(sphere4);

        var position = POSSIBLE_GHOST_POSITIONS[Math.floor(Math.random() * POSSIBLE_GHOST_POSITIONS.length)];
        this.ghost.position.set(position.x, position.y, position.z);
        this.cube.position.set(position.x, position.y, position.z);
    }

    get_rotation(i, j) {
        var directions = [];
        if (maze[i+2][j] != 1 && i != 34) {
            directions.push('up');
        }

        if (maze[i-2][j] != 1) {
            directions.push('down');
        }

        if (maze[i][j-2] != 1 && i!=22) {
            directions.push('left');
        }

        if (maze[i][j+2] != 1 && i!=22) {
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

        this.current_angle += this.sphere_speed;

        for (var i=0; i < this.ghost.children.length; i++) {
            var obj = this.ghost.children[i];
            if (obj.name == 'sphere1') {
                obj.position.x = this.radius * Math.sin(this.current_angle);
                obj.position.z = this.radius * Math.cos(this.current_angle);
            }
            else if (obj.name == 'sphere2') {
                obj.position.x = this.radius * Math.cos(this.current_angle);
                obj.position.z = -this.radius * Math.sin(this.current_angle);
            }
            else if (obj.name == 'sphere3') {
                obj.position.x = -this.radius * Math.cos(this.current_angle);
                obj.position.z = this.radius * Math.sin(this.current_angle);
            }
            else if (obj.name == 'sphere4') {
                obj.position.x = -this.radius * Math.sin(this.current_angle);
                obj.position.z = -this.radius * Math.cos(this.current_angle);
            }
        }

        this.cube.position.set(this.ghost.position.x, this.ghost.position.y, this.ghost.position.z);
    }
}

function loadGhost(loader, color) {
    loader.load(
        '3DModels/pacman_ghost.obj', 

        (object) => {
            object.scale.set(4, 3, 4);

            object.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    child.material.color.setHex(color);
                }
            });
            GHOST_MODELS.push(object);
        }
    );
}


export {
    Ghost,
    loadGhost,
}