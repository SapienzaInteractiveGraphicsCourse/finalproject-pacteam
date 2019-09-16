
export default class Ghost {
    constructor() {
        this.ghost = undefined;
    }

    loadGhost(loader) {
        loader.load(
            '3DModels/pacman_ghost.obj', 
    
			(object) => {
				object.scale.set(0.15, 0.15, 0.15);
				object.rotation.y -= Math.PI/2;
                object.rotation.z -= Math.PI/2;
                object.position.set(110, 1, -10);
			
				/* object.traverse( (child) => {
					if (child instanceof THREE.Mesh ) {
						//child.material.color.setHex(0xffff00);
					}
                }); */

                this.ghost = object;
            }
        );


    }
}