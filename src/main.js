// Scene And Camera
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 45, window.innerWidth/window.innerHeight, 1, 200 );
var controls = new THREE.OrbitControls( camera );

// Orbit Control Setting
controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
controls.dampingFactor = 0.8;
controls.panningMode = THREE.HorizontalPanning; // default is THREE.ScreenSpacePanning
controls.minDistance = 10;
controls.maxDistance = 100
controls.maxPolarAngle = Math.PI / 2 - 0.5;

// Renderer
var renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );

/*renderer.gammaInput = true;
renderer.gammaOutput = true;*/

document.body.appendChild( renderer.domElement );

// AmbientLight
var light = new THREE.AmbientLight( 0xffffff, 0.5, 100 );
//light.position.set( 10, 10, 10 );
scene.add( light );

var hlight = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
scene.add( hlight );

// Fog
var fogColor = new THREE.Color('skyblue');

scene.background = fogColor;
scene.fog = new THREE.Fog(fogColor, 30, 150);

// Camera Position
camera.position.set( 0, 80, 0 );
controls.update();

// Mouse Event
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

window.addEventListener( 'mousedown', onMouseDown, false );

function onMouseDown( event ) {
	if(event.button == 2){
		mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;


		// Mouse Move Raycaster
		raycaster.setFromCamera( mouse, camera );

		var intersects = raycaster.intersectObjects( ground_group.children );

		if(intersects.length > 0){
			var camera_heightx = intersects[0].object.position.x;
			var camera_heighty = intersects[0].object.position.y;
			var camera_heightz = intersects[0].object.position.z;
			camera.userData.target = new THREE.Vector3(0, camera_heighty, 0);

			ground_group.userData.target = new THREE.Vector3();
			ground_group.userData.target.x = camera_heightx;
			ground_group.userData.target.x *= -1;
			ground_group.userData.target.z = camera_heightz;
			ground_group.userData.target.z *= -1;
		}
	}
}

// Map
var map = [];
var waters = [];
var map_size = 80;
var seeds = {
	elevation : Math.random(),
	swamp : Math.random(),
	reed : Math.random(),
	tree : Math.random(),
}

// Map Setting
for (var z = 0; z < map_size; z++) {
	map.push( [] );
	for (var x = 0; x < map_size; x++) {
		var data = {
			height : 0,
			density : 0,
			cube : false,
			type : '',
			terrain : {
				name : '',
				density : 0,
			},
		};

		// Ground Elevation
		noise.seed(seeds.elevation);
		var value = noise.perlin2(x / 140, z / 140) + 0.25;
		value += noise.perlin2(x / 100, z / 100) / 2;
		value += noise.perlin2(x / 50, z / 50) / 4;
		value += noise.perlin2(x / 10, z / 10) / 6;

		value *= 10;

		data.density = value;
		if (value >= 0) {
			data.height = parseInt(value);
			data.type = 'ground';
		} else {
			data.type = 'water';
		}

		// Swamp
		noise.seed(seeds.swamp);
		var value = noise.perlin2(x / 30, z / 30);

		if (data.type == 'ground') {
			value -= data.height / 3;

			if (value >= 0) {
				data.type = 'swamp';
			}
		}

		// Tree
		noise.seed(seeds.tree);
		var value = noise.perlin2(x / 20, z / 20) - 1;
		value += noise.perlin2(x / 10, z / 10) / 2;
		value += noise.perlin2(x / 5, z / 5) / 4;
		value += noise.perlin2(x / 2, z / 2) / 6;

		if (data.type == 'ground') {
			value += 0.7;
		} else if (data.type == 'water') {
			value = -1;
		}

		if (value >= 0) {
			data.terrain = {
				name : 'tree',
				density : value,
			};
		}

		// Reed
		noise.seed(seeds.reed);
		var value = noise.perlin2(x / 20, z / 20) - 0.2;

		if (data.type == 'water') {
			value -= (data.density * -1) / 2;
		} else if (data.type == 'ground') {
			value -= data.height / 2;
		} else if (data.type == 'swamp') {
			value -= data.height / 6;
		}

		if (value >= 0) {
			data.terrain = {
				name : 'reed',
				density : value,
			};
		}

		map[z].push(data);
	}
}

// Draw 3D Box
var geometry = new THREE.BoxBufferGeometry( 0.98, 1, 0.98 );
var tree_geometry = new THREE.BoxBufferGeometry( 0.3, 0.5, 0.3 );

var ground_material = new THREE.MeshStandardMaterial( { color: 0x00ff00 } );
var tree_b_material = new THREE.MeshStandardMaterial( { color: new THREE.Color('brown') } );
var reed_material = new THREE.MeshStandardMaterial( { color: new THREE.Color('brown') } );
var water_material = new THREE.MeshStandardMaterial( { color: new THREE.Color('rgb(0,0,255)') } );
var swamp_material = new THREE.MeshStandardMaterial( { color: new THREE.Color('rgb(0, 128, 59)') } );
var tree_material = new THREE.MeshStandardMaterial( { color: new THREE.Color('green') } );

water_material.transparent = true;
water_material.opacity = 0.6;

reed_material.transparent = true;
reed_material.opacity = 0.5;

tree_material.transparent = true;
tree_material.opacity = 0.5;

var ground_group = new THREE.Group();
var terrain_group = new THREE.Group();

for (var z = 0; z < map_size; z++) {
	for (var x = 0; x < map_size; x++) {
		var here = map[z][x];

		// Add Type Object
		var type_cube;

		if (here.type == 'water') {
			type_cube = new THREE.Mesh( geometry, water_material );

			type_cube.position.x = x - map_size/2;
			type_cube.position.y = - 0.5;
			type_cube.position.z = z - map_size/2;

			type_cube.position.y += Math.random()/2;

			waters.push( { obj : type_cube, going : 'up' } );
		} else if (here.type == 'ground') {
			type_cube = new THREE.Mesh( geometry, ground_material );

			type_cube.position.x = x - map_size/2;
			type_cube.position.y = here.height;
			type_cube.position.z = z - map_size/2;
		} else if (here.type == 'swamp') {
			type_cube = new THREE.Mesh( geometry, swamp_material );

			type_cube.position.x = x - map_size/2;
			type_cube.position.y = here.height;
			type_cube.position.z = z - map_size/2;
		}
		ground_group.add(type_cube);

		// Add Terrain Object
		var terrain_cube;

		if (here.terrain.name == 'reed') {
			terrain_cube = new THREE.Mesh( geometry, reed_material );

			var density = 0.2+here.terrain.density/1.5;
			terrain_cube.scale.set(density, 1+density, density);

			var height = terrain_cube.geometry.parameters.height * density;

			terrain_cube.position.x = x - map_size/2;
			terrain_cube.position.y = here.height + 0.3 + height / 2;
			terrain_cube.position.z = z - map_size/2;

			terrain_group.add(terrain_cube);
		} else if (here.terrain.name == 'tree') {
			// Tree
			terrain_cube = new THREE.Mesh( tree_geometry, tree_b_material );

			var density = 0.2+here.terrain.density*2;
			terrain_cube.scale.set(density, 1, density);

			terrain_cube.position.x = x - map_size/2;
			terrain_cube.position.y = here.height + 0.75;
			terrain_cube.position.z = z - map_size/2;

			terrain_group.add(terrain_cube);

			// Tree Leaf
			terrain_cube = new THREE.Mesh( geometry, tree_material );

			var density = 0.5+here.terrain.density*1.5;
			terrain_cube.scale.set(density, density, density);

			terrain_cube.position.x = x - map_size/2;
			terrain_cube.position.y = here.height + 1;
			terrain_cube.position.z = z - map_size/2;

			terrain_group.add(terrain_cube);
		}
	}
}
scene.add( ground_group );
scene.add( terrain_group );

var animate = function () {
	requestAnimationFrame( animate );

	// Ground View Change Camera Smooth Move
	if(ground_group.userData.target) {
		var target = ground_group.userData.target;
		var ground = ground_group.position;

		if(target.x > ground.x) {
			ground.x += 0.5;
		}
		if (target.x < ground.x) {
			ground.x -= 0.5;
		}

		if(target.z > ground.z) {
			ground.z += 0.5;
		}
		if (target.z < ground.z) {
			ground.z -= 0.5;
		}

		if(ground.x == target.x && ground.z == target.z) {
			ground_group.userData.target = false;
		}

		terrain_group.position.set(ground.x, ground.y, ground.z);
	}

	if(camera.userData.target) {
		var target = camera.userData.target;

		if(controls.target.y < target.y) {
			controls.target.set(0, controls.target.y+0.1, 0);
		}
		if(controls.target.y > target.y) {
			controls.target.set(0, controls.target.y-0.1, 0);
		}

		if(controls.target.y == target.y) {
			camera.userData.target = false;
		}
	}

	// Water Wave
	for (var w = 0, len = waters.length; w < len; w++) {
		var water = waters[w];
		var height = water.obj.position.y;

		if (height >= -0) {
			water.going = 'down';
		} else if (height <= -0.2) {
			water.going = 'up';
		}

		if (water.going == 'down') {
			water.obj.position.y -= 0.01;
		} else if (water.going == 'up') {
			water.obj.position.y += 0.01;
		}
	}

	//cube.rotation.z += 0.05;
	controls.update();

	renderer.render(scene, camera);
};

animate();
