// Scene And Camera
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 45, window.innerWidth/window.innerHeight, 1, 10000 );
var controls = new THREE.OrbitControls( camera );

// Orbit Control Setting
controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
controls.dampingFactor = 0.8;
controls.panningMode = THREE.HorizontalPanning; // default is THREE.ScreenSpacePanning
controls.minDistance = 1;
controls.maxDistance = 400
//controls.maxPolarAngle = Math.PI / 2 + 0.3;

// Renderer
var renderer = new THREE.WebGLRenderer({ antialias: false });

renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );

/*renderer.gammaInput = true;
renderer.gammaOutput = true;*/

document.body.appendChild( renderer.domElement );

//Create a DirectionalLight and turn on shadows for the light
var light = new THREE.AmbientLight( 0xffffff, 0.5, 100 );
//light.position.set( 10, 10, 10 );
scene.add( light );

var hlight = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
scene.add( hlight );

// Fog
/*var fogColor = new THREE.Color('skyblue');

scene.background = fogColor;
scene.fog = new THREE.Fog(fogColor, 30, 120);*/

// Camera Position
camera.position.set( 0, 80, 0 );
controls.update();

// Map
var map = [];
var cloud_map = [];
var waters = [];
var map_size = 80;
var seeds = {
	elevation : Math.random(),
	swamp : Math.random(),
	reed : Math.random(),
	cloud : Math.random(),
}

// Map Setting
for (var z = 0; z < map_size; z++) {
	map.push( [] );
	cloud_map.push( [] );
	for (var x = 0; x < map_size; x++) {
		var data = {
			height : 0,
			density : 0,
			cube : false,
			type : '',
			terrain : '',
		};

		// Ground Elevation
		noise.seed(seeds.elevation);
		var value = noise.perlin2(x / 120, z / 120) + 0.25;
		value += noise.perlin2(x / 100, z / 100) / 2;
		value += noise.perlin2(x / 50, z / 50) / 3;
		value += noise.perlin2(x / 10, z / 10) / 4;

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

		// Reed
		noise.seed(seeds.reed);
		var value = noise.perlin2(x / 20, z / 20) - 0.3;

		if (data.type == 'water') {
			value -= (data.density * -1) / 2;
		} else if (data.type == 'ground') {
			value -= data.height / 2;
		} else if (data.type == 'swamp') {
			value -= data.height / 6;
		}

		if (value >= 0) {
			data.terrain = 'reed';
		}

		// Cloud
		cloud_map[z].push( [] );
		for(var h = 0; h < data.height+30; h++) {
			var he = h - data.height;
			// Cloud
			noise.seed(seeds.cloud);
			var value = noise.perlin3(x / 20, z / 20, h / 20) - 1;
			value += noise.perlin3(x / 10, z / 10, h / 10) / 2;
			if(value < 0) {
				value += noise.perlin3(x / 5, z / 5, h / 5) / 4;
			}

			if(he > 20 && he <= 25) {
				value += he / 100;
			}

			if(he > 25) {
				value += 0.8;
				value -= he / 20 * 0.2;
				//console.log(value);
			}
			cloud_map[z][x].push(value);
		}

		map[z].push(data);
	}
}

// Draw 3D Box
var geometry = new THREE.BoxGeometry( 0.98, 1, 0.98 );
var ground_material = new THREE.MeshStandardMaterial( { color: 0x00ff00 } );
var reed_material = new THREE.MeshStandardMaterial( { color: new THREE.Color('brown') } );
var water_material = new THREE.MeshStandardMaterial( { color: new THREE.Color('rgb(0,0,255)') } );
var swamp_material = new THREE.MeshStandardMaterial( { color: new THREE.Color('rgb(0, 128, 59)') } );
var cloud_material = new THREE.MeshStandardMaterial( { color: new THREE.Color('rgb(255, 255, 255)') } );

water_material.transparent = true;
water_material.opacity = 0.6;

reed_material.transparent = true;
reed_material.opacity = 0.3;

cloud_material.transparent = true;
cloud_material.opacity = 0.1;

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

			data.cube = cube;
			waters.push( { obj : cube, going : 'up' } );
		} else if (here.type == 'ground') {
			var cube = new THREE.Mesh( geometry, ground_material );

			cube.position.x = x - map_size/2;
			cube.position.y = here.height;
			cube.position.z = z - map_size/2;

			scene.add( cube );

			data.cube = cube;
		} else if (here.type == 'swamp') {
			var cube = new THREE.Mesh( geometry, swamp_material );

			cube.position.x = x - map_size/2;
			cube.position.y = here.height;
			cube.position.z = z - map_size/2;

			scene.add( cube );

			data.cube = cube;
		}

		// Cloud
		for(var h = 0; h < here.height+30; h++) {
			var cell = cloud_map[z][x][h];

			if(cell > 0) {
				var cube = new THREE.Mesh( geometry, cloud_material );

				cube.position.x = x - map_size/2;
				cube.position.y = h;
				cube.position.z = z - map_size/2;

				scene.add( cube );
			}
		}

		if (here.terrain == 'reed') {
			var cube = new THREE.Mesh( geometry, reed_material );

			cube.position.x = x - map_size/2;
			cube.position.y = here.height + 1;
			cube.position.z = z - map_size/2;

			scene.add( cube );

			data.terrain = cube;
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
	controls.update();

	renderer.render(scene, camera);
};

animate();
