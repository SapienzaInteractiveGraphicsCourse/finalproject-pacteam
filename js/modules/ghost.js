export default class Ghost {
    constructor() {
        this.ghost;
    }

    loadGhost(loader) {
        loader.load(
            '3DModels/pacman_ghost.obj', 
    
			(object) => {
				object.scale.set(1.5, 1.5, 1.5);
                object.position.set(110, 5, -10);
			
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