var scene;
var camera;
var orbitControls;
var renderer;
var lights;
var fogs;
var clock;

var map;
var mouse;
var raycaster;
var geometry;
var material;
var group;

function Init() {
	// Scene And Camera
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 600 );
	orbitControls = new THREE.OrbitControls( camera );

	// Renderer
	renderer = new THREE.WebGLRenderer( { antialias: true } );

	// Light
	lights = {
		day : {
			ambientLight : new THREE.AmbientLight( 0xffffff, 0.5, 100 ),
			hemisphereLight : new THREE.HemisphereLight( 0xffffff, 0x000000, 1 ),
		},
		night : {
			ambientLight : new THREE.AmbientLight( 0xaaaaaa, 0.5, 100 ),
			hemisphereLight : new THREE.HemisphereLight( 0xaaaaaa, 0x000000, 1 ),
		},
	};

	// Fog
	fogs = {
		day : {
			fog : new THREE.Fog( new THREE.Color( 'skyblue' ), 40, 120 ),
		},
		night : {
			fog : new THREE.Fog( new THREE.Color( 'rgb(30, 30, 30)' ), 20, 60 ),
		},
	};

	// Clock
	clock = new THREE.Clock();

	// Camera Setting
	camera.position.set( 0, 80, 0 );
	camera.userData = { target : false };

	// Orbit Control Setting
	orbitControls.enableDamping = true;
	orbitControls.dampingFactor = 0.8;
	orbitControls.panningMode = THREE.HorizontalPanning;
	orbitControls.minDistance = 10;
	orbitControls.maxDistance = 400
	orbitControls.maxPolarAngle = Math.PI / 2;
	orbitControls.update();

	// Renderer Setting
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );

	// Add Light to Scene
	scene.add( lights.day.ambientLight );
	scene.add( lights.day.hemisphereLight );

	/*scene.add( lights.night.ambientLight );
	scene.add( lights.night.hemisphereLight );*/

	// Add Fog to Scene
	/*scene.background = fogs.day.fog.color;
	scene.fog = fogs.day.fog;

	scene.background = fogs.night.fog.color;
	scene.fog = fogs.night.fog;*/

	// Map
	map = {
		map : [],
		size : 60,
		offset : new THREE.Vector2(),
		seeds : {
			elevation : Math.random(),
			reed : Math.random(),
			tree : Math.random(),
			steel : Math.random(),
			swamp : Math.random(),
			plain : Math.random(),
			desert : Math.random(),
		},
	};

	// Mouse
	mouse = {
		position : new THREE.Vector2(),
	};

	// Raycaster
	raycaster = new THREE.Raycaster();

	// Geometry
	geometry = {
		ground : new THREE.BoxBufferGeometry( 1.98, 0.5, 1.98 ),
		box : new THREE.BoxBufferGeometry( 1, 1, 1 ),
	};

	// Material
	material = {
		grass : new THREE.MeshStandardMaterial( { color: new THREE.Color('rgb(0,220,0)') } ),
		tree_wood : new THREE.MeshStandardMaterial( { color: new THREE.Color('brown') } ),
		coast : new THREE.MeshStandardMaterial( { color: new THREE.Color('rgb(0,0,200)') } ),
		ocean : new THREE.MeshStandardMaterial( { color: new THREE.Color('rgb(0,0,120)') } ),
		swamp : new THREE.MeshStandardMaterial( { color: new THREE.Color('rgb(0,140,70)') } ),
		tree_leaf : new THREE.MeshStandardMaterial( { color: new THREE.Color('green') } ),
		steel : new THREE.MeshStandardMaterial( { color: new THREE.Color('rgb(150,150,150)') } ),
		desert : new THREE.MeshStandardMaterial( { color: new THREE.Color('rgb(220,186,141)') } ),
		plain : new THREE.MeshStandardMaterial( { color: new THREE.Color('rgb(140,230,0)') } ),
		empty : new THREE.MeshStandardMaterial( { color: new THREE.Color('rgb(0,0,0)') } ),
	};

	// Group
	group = {
		ground : new THREE.Group(),
		terrain : new THREE.Group(),
		mineral : new THREE.Group(),
	};

	// Material Setting
	material.coast.transparent = true;
	material.coast.opacity = 0.8;

	material.ocean.transparent = true;
	material.ocean.opacity = 0.8;

	material.tree_leaf.transparent = true;
	material.tree_leaf.opacity = 0.5;

	material.steel.transparent = true;
	material.steel.opacity = 0.8;

	material.empty.transparent = true;
	material.empty.opacity = 0;

	// Add Group to Scene
	scene.add( group.ground );
	scene.add( group.terrain );
	scene.add( group.mineral );

	MapInit();
}

// Mouse Event
window.addEventListener('mousedown', onMouseDown, false);

function onMouseDown( event ) {
	if (event.button == 2) {
		mouse.position.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		mouse.position.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

		// Mouse Move Raycaster
		raycaster.setFromCamera( mouse.position, camera );

		var intersects = raycaster.intersectObjects( group.ground.children );

		if (intersects.length > 0) {
			var offset_posx = intersects[0].object.position.x;
			var offset_posy = intersects[0].object.position.y;
			var offset_posz = intersects[0].object.position.z;

			map.offset.x += (offset_posx + map.offset.x) * -1;
			map.offset.y += (offset_posz + map.offset.y) * -1;

			orbitControls.target = new THREE.Vector3( 0, offset_posy, 0 );
		}
	}
}

var mainLoop = function () {
	requestAnimationFrame( mainLoop );

	var delta = clock.getDelta();

	{
		var pos = group.ground.position;
		if (pos.x > map.offset.x) {
			pos.x -= 1;
		} else if (pos.x < map.offset.x) {
			pos.x += 1;
		}

		if (pos.z > map.offset.y) {
			pos.z -= 1;
		} else if (pos.z < map.offset.y) {
			pos.z += 1;
		}
		group.terrain.position.set( pos.x, pos.y, pos.z );
		group.mineral.position.set( pos.x, pos.y, pos.z );
	}

	orbitControls.update();

	renderer.render( scene, camera );
};

Init();
mainLoop();
