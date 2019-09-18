var spotLight = new THREE.SpotLight(0xffffff, 0.9, 200, Math.PI/4, 1, 2);
spotLight.castShadow = true;

var target_object = new THREE.Object3D();
target_object.position.set(100, 1, -10);
spotLight.target = target_object;

// Create a source of light
var dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(100, 80, -50);

// Create ambient light
var ambientLight = new THREE.AmbientLight(0xffffff, 0.3);

export {
    spotLight, target_object, dirLight, ambientLight
};

