// Scene And Camera
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 45, window.innerWidth/window.innerHeight, 1, 1000 );
var controls = new THREE.OrbitControls( camera );

// Orbit Control Setting
controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
controls.dampingFactor = 0.8;
controls.panningMode = THREE.HorizontalPanning; // default is THREE.ScreenSpacePanning
controls.minDistance = 10;
controls.maxDistance = 400
controls.maxPolarAngle = Math.PI / 2;

camera.userData = {
	target : false,
};

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

var hlight = new THREE.HemisphereLight( 0xffffff, 0x000000, 1 );
scene.add( hlight );

// Fog
/*var fogColor = new THREE.Color('skyblue');

scene.background = fogColor;
scene.fog = new THREE.Fog(fogColor, 40, 120);*/



// Night Mode
// AmbientLight
/*var light = new THREE.AmbientLight( 0xaaaaaa, 0.5, 100 );
//light.position.set( 10, 10, 10 );
scene.add( light );

var hlight = new THREE.HemisphereLight( 0xaaaaaa, 0x000000, 1 );
scene.add( hlight );

// Fog
var fogColor = new THREE.Color('rgb(30, 30, 30)');

scene.background = fogColor;
scene.fog = new THREE.Fog(fogColor, 20, 60);*/



// Camera Position
camera.position.set( 0, 80, 0 );
controls.update();

// Mouse Event
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

window.addEventListener( 'mousedown', onMouseDown, false );

function onMouseDown( event ) {
	if (event.button == 2) {
		mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

		// Mouse Move Raycaster
		raycaster.setFromCamera( mouse, camera );

		var intersects = raycaster.intersectObjects( ground_group.children );

		if (intersects.length > 0) {
			camera.userData.target = new THREE.Vector3();

			var camera_heightx = intersects[0].object.position.x;
			var camera_heighty = intersects[0].object.position.y;
			var camera_heightz = intersects[0].object.position.z;

			var xgap = camera.position.x - controls.target.x;
			var zgap = camera.position.z - controls.target.z;

			camera.userData.target.x = camera_heightx;
			camera.userData.target.z = camera_heightz;

			//controls.target = new THREE.Vector3(camera_heightx, camera_heighty, camera_heightz);
		}
	}
}

// Map
var map = [];
var map_size = 50;
var seeds = {
	elevation : Math.random(),
	reed : Math.random(),
	tree : Math.random(),
	rock : Math.random(),
	swamp : Math.random(),
	plain : Math.random(),
	desert : Math.random(),
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
			terrain : [],
			/*

			terrain : [{
				name : false,
				density : false,
			}]

			*/
		};

		// Ground Elevation
		noise.seed(seeds.elevation);
		var value = noise.perlin2(x / 1000, z / 1000)*2;
		value += noise.perlin2(x / 100, z / 100) / 2;
		value += noise.perlin2(x / 60, z / 60) / 3;
		value += noise.perlin2(x / 40, z / 40) / 4;
		value += noise.perlin2(x / 20, z / 20) / 5;
		value += noise.perlin2(x / 10, z / 10) / 6;

		value *= 10;

		data.density = value;
		if (value > 0) {
			data.height = parseInt(value);
			data.type = 'ground';
		} else if (value >= -1) {
			data.type = 'coast';
		} else {
			data.type = 'ocean';
		}

		// Swamp
		noise.seed(seeds.swamp);
		var value = noise.perlin2(x / 10, z / 10) - 0.3;

		if (data.type == 'ground') {
			value -= data.height / 2;

			if (value > 0) {
				data.type = 'swamp';
			}
		}

		// Plain
		noise.seed(seeds.plain);
		var value = noise.perlin2(x / 20, z / 20) - 0.1;
		value += noise.perlin2(x / 10, z / 10) / 2;
		value += noise.perlin2(x / 5, z / 5) / 3;

		if (data.type == 'ground') {
			if (value > 0) {
				data.type = 'plain';
			}
		}

		// Desert
		noise.seed(seeds.desert);
		var value = noise.perlin2(x / 50, z / 50)-0.7;
		value += noise.perlin2(x / 20, z / 20) / 2;
		value += noise.perlin2(x / 10, z / 10) / 3;
		value += noise.perlin2(x / 5, z / 5) / 4;

		if (data.type == 'ground') {
			if (value > 0) {
				data.type = 'desert';
			}
		}

		// Rock
		noise.seed(seeds.rock);
		var value = noise.perlin2(x / 3, z / 3) - 0.3;

		if (value > 0 && data.height > 0) {
			data.terrain.push({
				name : 'rock',
				density : value,
			});
		}

		// Tree
		noise.seed(seeds.tree);
		var value = noise.perlin2(x / 10, z / 10) - 0.9;

		if (data.type == 'ground' || data.type == 'plain') {
			value += 0.7;
		} else if (data.height > 0) {
			value = -1;
		}

		if (value >= 0) {
			data.terrain.push({
				name : 'tree',
				density : value,
			});
		}

		map[z].push(data);
	}
}

// Draw 3D Box

// Geometry Setting
var geometry = new THREE.BoxBufferGeometry( 1.98, 0.5, 1.98 );
var box_geometry = new THREE.BoxBufferGeometry( 1, 1, 1 );

// Material Setting
var ground_material = new THREE.MeshStandardMaterial( { color: new THREE.Color('rgb(0,220,0)') } );
var tree_wood_material = new THREE.MeshStandardMaterial( { color: new THREE.Color('brown') } );
var coast_material = new THREE.MeshStandardMaterial( { color: new THREE.Color('rgb(0,0,200)') } );
var ocean_material = new THREE.MeshStandardMaterial( { color: new THREE.Color('rgb(0,0,120)') } );
var swamp_material = new THREE.MeshStandardMaterial( { color: new THREE.Color('rgb(0,140,70)') } );
var tree_leaf_material = new THREE.MeshStandardMaterial( { color: new THREE.Color('green') } );
var rock_material = new THREE.MeshStandardMaterial( { color: new THREE.Color('rgb(100,100,100)') } );
var desert_material = new THREE.MeshStandardMaterial( { color: new THREE.Color('rgb(220,186,141)') } );
var plain_material = new THREE.MeshStandardMaterial( { color: new THREE.Color('rgb(140,230,0)') } );
var empty_material = new THREE.MeshStandardMaterial( { color: new THREE.Color('rgb(0,0,0)') } );

// Material Opacity
coast_material.transparent = true;
coast_material.opacity = 0.8;

ocean_material.transparent = true;
ocean_material.opacity = 0.8;

tree_leaf_material.transparent = true;
tree_leaf_material.opacity = 0.5;

rock_material.transparent = true;
rock_material.opacity = 0.8;

empty_material.transparent = true;
empty_material.opacity = 0;

var ground_group = new THREE.Group();
var terrain_group = new THREE.Group();

for (var z = 0; z < map_size; z++) {
	for (var x = 0; x < map_size; x++) {
		var here = map[z][x];

		// Add Type Object
		var type_cube = false;
		var position = new THREE.Vector3();
		var material = false;

		position.x = x*2 - map_size*2/2;
		position.y = here.height*0.5;
		position.z = z*2 - map_size*2/2;

		if (here.type == 'ocean') {
			material = ocean_material;

			position.y = - 0.2;
			/*position.y += Math.random()/2;*/
		} else if (here.type == 'coast') {
			material = coast_material;

			position.y = - 0.2;
		} else if (here.type == 'ground') {
			material = ground_material;
		} else if (here.type == 'swamp') {
			material = swamp_material;
		} else if (here.type == 'desert') {
			material = desert_material;
		} else if (here.type == 'plain') {
			material = plain_material;
		}

		// Add Cube
		type_cube = new THREE.Mesh( geometry, empty_material );
		var cube = new THREE.Mesh( geometry, material );

		var near = [
			[z,x+1],
			[z+1,x],
			[z,x-1],
			[z-1,x],
		];

		var cliffgap = 0;
		for (var n = 0; n < near.length; n++) {
			var ne = near[n];

			if (ne[0] < map_size && ne[1] < map_size && ne[0] >= 0 && ne[1] >= 0) {
				var tile = map[ne[0]][ne[1]];
				/*if (tile.height == here.height - 1) {
					var stair = new THREE.Mesh( geometry, material );
					var ran = Math.random()/10;
					stair.scale.set(1.1+ran, 0.8+ran, 1.1+ran);

					stair.position.y = -0.5;

					type_cube.add(stair);


					var stair = new THREE.Mesh( geometry, material );
					stair.scale.set(1.2+ran, 0.7+ran, 1.2+ran);

					stair.position.y = -1;

					type_cube.add(stair);
				}*/
				if (tile.height <= (here.height - 2)) {
					var gap = here.height - (tile.height);
					if (gap >= cliffgap) {
						cliffgap = gap;
					}
				}
			}
		}

		for (var g = 0; g < cliffgap; g++) {
			var cliff = new THREE.Mesh( geometry, material );

			cliff.position.y = -0.5*(g+1);

			type_cube.add(cliff);
		}

		type_cube.add(cube);

		type_cube.position.add(position);
		ground_group.add( type_cube );

		// Add Terrain Object
		var terrain_cube = new THREE.Group();
		var position = new THREE.Vector3();

		position.x = x*2 - map_size*2/2;
		position.y = here.height*0.5;
		position.z = z*2 - map_size*2/2;

		for (var t = 0; t < here.terrain.length; t++) {
			var ter = here.terrain[t];

			if (ter.name == 'tree') {
				var poslist = [];	// Tree Position, new THREE.Vector3()
				for (var w = 0; w < ter.density*4; w++){
					wood_group = new THREE.Group();

					wood_group.rotation.y = Math.random();

					// Tree TooClose
					var loopcount = 0;
					var tooclose = false;
					do {
						tooclose = false;
						var newpos = new THREE.Vector3();

						newpos.x = (Math.random()-0.5)*1.5;
						newpos.z = (Math.random()-0.5)*1.5;

						for(var p = 0; p < poslist.length; p++) {
							var po = poslist[p];

							if(newpos.distanceTo(po) <= 1) {
								tooclose = true;
								break;
							}
						}

						wood_group.position.x = newpos.x;
						wood_group.position.z = newpos.z;

						loopcount += 1;
						if(loopcount >= 10)
							break;
					} while (tooclose);

					poslist.push(new THREE.Vector3().copy(wood_group.position));

					// Wood
					var rand = Math.random();

					var wood_mesh = new THREE.Mesh( box_geometry, tree_wood_material );

					var density = 0.05;	//+ter.density/2
					var height = 0.5;	//+ter.density/2

					if (rand >= 0.8) {
						height += ter.density/4;
						density += ter.density/6;
					}

					wood_mesh.scale.set(density, height, density);

					wood_mesh.position.y = 0.25+height/2;;

					wood_group.add(wood_mesh);

					// Leaf
					var leaf_mesh = new THREE.Mesh( box_geometry, tree_leaf_material );

					var density = 0.5;	//+ter.density*1.3

					if (rand >= 0.8) {
						density += ter.density/2;
					}

					leaf_mesh.scale.set(density, density, density);

					leaf_mesh.position.y = 0.25+height;

					wood_group.add(leaf_mesh);

					terrain_cube.add(wood_group);
				}
			}
			if (ter.name == 'rock') {
				var density = 0.2+ter.density*2.5;

				var terrain = new THREE.Mesh( box_geometry, rock_material );

				terrain.scale.set( density, density/4, density );

				terrain.position.y = 0.25;

				terrain_cube.add(terrain);
			}
		}

		if (terrain_cube) {
			terrain_cube.position.add(position);
			terrain_group.add(terrain_cube);
		}
	}
}
scene.add( ground_group );
scene.add( terrain_group );

var animate = function () {
	requestAnimationFrame( animate );

	// Ground View Change Camera Smooth Move
	if (camera.userData.target) {
		var target = camera.userData.target;
		var pos = controls.target;

		if (target.x > pos.x) {
			controls.target.x += 1;
		}
		if (target.x < pos.x) {
			controls.target.x -= 1;
		}

		if (target.z > pos.z) {
			controls.target.z += 1;
		}
		if (target.z < pos.z) {
			controls.target.z -= 1;
		}

		if (controls.target.x == target.x && controls.target.z == target.z) {
			camera.userData.target = false;
		}
	}

	controls.update();

	renderer.render(scene, camera);
};

animate();
