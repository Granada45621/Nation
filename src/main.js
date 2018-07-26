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

for (var z = 0; z < map_size; z++) {
	for (var x = 0; x < map_size; x++) {
		var here = map[z][x];

		// Three Js 3D
		if (here.type == 'water') {
			var cube = new THREE.Mesh( geometry, water_material );

			cube.position.x = x - map_size/2;
			cube.position.y = - 0.5;
			cube.position.z = z - map_size/2;

			cube.position.y += Math.random()/2;
			scene.add( cube );

			waters.push( { obj : cube, going : 'up' } );
		} else if (here.type == 'ground') {
			var cube = new THREE.Mesh( geometry, ground_material );

			cube.position.x = x - map_size/2;
			cube.position.y = here.height;
			cube.position.z = z - map_size/2;

			scene.add( cube );
		} else if (here.type == 'swamp') {
			var cube = new THREE.Mesh( geometry, swamp_material );

			cube.position.x = x - map_size/2;
			cube.position.y = here.height;
			cube.position.z = z - map_size/2;

			scene.add( cube );
		}

		if (here.terrain.name == 'reed') {
			var cube = new THREE.Mesh( geometry, reed_material );

			var density = 0.2+here.terrain.density*2;
			cube.scale.set(density, density, density);

			var height = cube.geometry.parameters.height * density;

			cube.position.x = x - map_size/2;
			cube.position.y = here.height + 0.5 + height / 2;
			cube.position.z = z - map_size/2;

			scene.add( cube );
		} else if (here.terrain.name == 'tree') {
			var cube = new THREE.Mesh( tree_geometry, tree_b_material );

			var density = 0.2+here.terrain.density*2;
			cube.scale.set(density, 1, density);

			cube.position.x = x - map_size/2;
			cube.position.y = here.height + 0.75;
			cube.position.z = z - map_size/2;

			scene.add( cube );

			var cube = new THREE.Mesh( geometry, tree_material );

			var density = 0.5+here.terrain.density*1.5;
			cube.scale.set(density, density, density);

			cube.position.x = x - map_size/2;
			cube.position.y = here.height + 1;
			cube.position.z = z - map_size/2;

			scene.add( cube );
		}
	}
}

var animate = function () {
	requestAnimationFrame( animate );

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
	var camera_height = map[map_size/2][map_size/2].height;
	controls.target.set(0, camera_height, 0);
	controls.update();

	renderer.render(scene, camera);
};

animate();
