export default class Ghost {
    constructor(type) {
        this.ghost;
        this.type = type;
    }

    loadGhost(loader, color) {
        loader.load(
            '3DModels/pacman_ghost.obj', 
    
			(object) => {
                object.scale.set(4, 3, 4);
                
                // Standard spawn location
                //object.position.set(100, 3, -130);
                object.position.set(110, 5, -10);
			
				object.traverse( (child) => {
					if (child instanceof THREE.Mesh) {
						child.material.color.setHex(color);
					}
                });
                this.ghost = object;
            }
        );
    }
}