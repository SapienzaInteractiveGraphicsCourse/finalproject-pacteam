export default class Ghost {

    constructor(torso_width, torso_height, torso_depth, eye_ray, head_ray, leg_height, leg_width) {
        this.ghost = new THREE.Group();
    }

    init_ghost(torso_width, torso_height, torso_depth, torso_color, head_ray, head_color, 
                eye_ray, eye_color, leg_height, leg_width, leg_depth, leg_color, 
                torso_pos) {
        var torso = new THREE.Mesh(
                new THREE.BoxBufferGeometry(torso_width, torso_height, torso_depth),
                new THREE.MeshPhongMaterial({color: torso_color}));
        var head = new THREE.Mesh(
                new THREE.SphereBufferGeometry(head_ray, 32, 32, 0, 2*Math.PI, 0, 0.5 * Math.PI),
                new THREE.MeshPhongMaterial({color: head_color}));
        var eye = new THREE.Mesh(
                new THREE.SphereBufferGeometry(eye_ray, 32, 32),
                new THREE.MeshPhongMaterial({color: eye_color}));
        var leg = new THREE.Mesh(
                new THREE.BoxBufferGeometry(leg_width, leg_height, leg_depth),
                new THREE.MeshPhongMaterial({color: leg_color}));

        torso.position.set(torso_pos.x, torso_pos.y, torso_pos.z);
        torso.receiveShadow = true;
        torso.castShadow = true;

        head.position.set(torso.position.x, torso.position.y, torso.position.z);
        head.position.y += torso_height / 2.2;
        head.receiveShadow = true;
        head.castShadow = true;

        this.ghost.add(torso, head);
    }
}