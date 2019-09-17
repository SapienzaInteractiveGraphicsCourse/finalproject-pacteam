export default class Ghost {
    constructor() {
        this.ghost;
    }

    loadGhost(loader) {
        loader.load(
            '3DModels/pacman_ghost.obj', 
    
			(object) => {
				object.scale.set(4, 3, 4);
                object.position.set(110, 5, -30);
			
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