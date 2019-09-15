export default class Ghost {

    constructor(torso_width, torso_height, torso_depth, eye_ray, head_ray, leg_height, leg_width) {
        this.ghost = new THREE.Object3D();
    }

    init_ghost(torso_width, torso_height, torso_depth, torso_color, head_ray, head_color, 
                eye_ray, eye_color, leg_height, leg_width, leg_depth, leg_color, 
                torso_pos) {
        var torso = new THREE.Mesh(
                new THREE.BoxGeometry(torso_width, torso_height, torso_depth),
                new THREE.MeshPhongMaterial({color: torso_color})),
            head = new THREE.Mesh(
                new THREE.SphereBufferGeometry(head_ray, 32, 32, 0, 2*Math.PI, 0, 0.5 * Math.PI),
                new THREE.MeshPhongMaterial({color: head_color})),
            eye = new THREE.Mesh(
                new THREE.SphereBufferGeometry(eye_ray, 32, 32),
                new THREE.MeshPhongMaterial({color: eye_color})),
            leg = new THREE.Mesh(
                new THREE.BoxGeometry(leg_width, leg_height, leg_depth),
                new THREE.MeshPhongMaterial({color: leg_color}));

        torso.position = torso_pos;

        head.position = torso.position;
        head.position.y += torso_height;

        this.ghost.add(torso, head);
    }
}