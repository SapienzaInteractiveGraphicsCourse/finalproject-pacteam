
let pacman_model;
class Pacman {
    constructor() {
        this.pacman = pacman_model;
        this.x_dim = 3;
        this.y_dim = 3;
        this.z_dim = 3;
    }
}

function loadPacman(loader) {
    loader.load(
        '3DModels/pacman.obj',
        (object) => {
            object.rotation.y -= Math.PI*50/126;
            object.rotation.z += 0.15;
            object.traverse( (child) => {
                if (child instanceof THREE.Mesh ) {
                    child.material.color.setHex(0xffff00);
                }
            });
            
            pacman_model = object;
            pacman_model.position.set(110, 6, -10);
        }
    );
}

export {Pacman, loadPacman}