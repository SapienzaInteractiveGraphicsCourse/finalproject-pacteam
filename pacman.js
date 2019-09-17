export default class Pacman {
    constructor() {
        this.pacman;
        this.x_dim = 4;
        this.y_dim = 4;
        this.z_dim = 4;
    }

    loadPacman(loader) {
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
                
                this.pacman = object;
                this.pacman.position.set(110, 6, -10);
            });
    }
}