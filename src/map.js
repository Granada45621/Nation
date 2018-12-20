// Map Setting
function MapInit() {
	// Make Number Map
	for (var z = 0; z < map.size; z++) {
		map.map.push( [] );
		for (var x = 0; x < map.size; x++) {
			var data = {
				height : 0,
				density : 0,
				cube : false,
				type : '',
				terrain : [],
				mineral : [],
				/*

				terrain : [{
					name : text,
					density : number,
				}]

				mineral : [{
					name : text,
					density : number,
				}]

				*/
			};

			// Ground Elevation
			noise.seed( map.seeds.elevation );
			var value = noise.simplex2( x / 1000, z / 1000 ) * 2 + 0.2;
			value += noise.simplex2( x / 100, z / 100 ) / 2;
			value += noise.perlin2( x / 60, z / 60 ) / 3;
			value += noise.perlin2( x / 40, z / 40 ) / 4;
			value += noise.perlin2( x / 20, z / 20 ) / 5;
			value += noise.perlin2( x / 10, z / 10 ) / 6;

			value *= 10;

			data.density = value;
			if (value > 0) {
				data.height = parseInt( value );
				data.type = 'grass';
			} else if (value >= -1) {
				data.type = 'coast';
			} else {
				data.type = 'ocean';
			}

			// Swamp
			noise.seed( map.seeds.swamp );
			var value = noise.perlin2( x / 10, z / 10 ) - 0.3;

			if (data.type == 'grass' || data.type == 'plain') {
				value -= data.height / 2;

				if (value > 0) {
					data.type = 'swamp';
				}
			}

			// Plain
			noise.seed( map.seeds.plain );
			var value = noise.perlin2( x / 20, z / 20 ) - 0.1;
			value += noise.perlin2( x / 10, z / 10 ) / 2;
			value += noise.perlin2( x / 5, z / 5 ) / 3;

			if (data.type == 'grass') {
				if (value > 0) {
					data.type = 'plain';
				}
			}

			// Desert
			noise.seed( map.seeds.desert );
			var value = noise.perlin2( x / 50, z / 50 )-0.7;
			value += noise.perlin2( x / 20, z / 20 ) / 2;
			value += noise.perlin2( x / 10, z / 10 ) / 3;
			value += noise.perlin2( x / 5, z / 5 ) / 4;

			if (data.type == 'grass') {
				if (value > 0) {
					data.type = 'desert';
				}
			}

			// Steel
			noise.seed( map.seeds.steel );
			var value = noise.perlin2( x / 5, z / 5 ) - 0.3;

			if (value > 0 && data.height > 0) {
				data.mineral.push({
					name : 'steel',
					density : value,
				});
			}

			// Tree
			noise.seed( map.seeds.tree );
			var value = noise.perlin2( x / 10, z / 10 ) - 0.9;

			if (data.type == 'grass' || data.type == 'plain') {
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

			map.map[z].push( data );
		}
	}

	// Add 3D Objects
	for (var z = 0; z < map.size; z++) {
		for (var x = 0; x < map.size; x++) {
			var here = map.map[z][x];

			// Add Type Object
			var type_cube = false;
			var position = new THREE.Vector3();
			var mat = false;

			position.x = x*2 - map.size*2/2;
			position.y = here.height*0.5;
			position.z = z*2 - map.size*2/2;

			if (here.type == 'ocean') {
				mat = material.ocean;

				position.y = - 0.2;
				/*position.y += Math.random()/2;*/
			} else if (here.type == 'coast') {
				mat = material.coast;

				position.y = - 0.2;
			} else if (here.type == 'grass') {
				mat = material.grass;
			} else if (here.type == 'swamp') {
				mat = material.swamp;
			} else if (here.type == 'desert') {
				mat = material.desert;
			} else if (here.type == 'plain') {
				mat = material.plain;
			}

			// Add Cube
			type_cube = new THREE.Mesh( geometry.ground, material.empty );
			var cube = new THREE.Mesh( geometry.ground, mat );

			var near = [
				[z,x+1],
				[z+1,x],
				[z,x-1],
				[z-1,x],
			];

			var cliffgap = 0;
			for (var n = 0; n < near.length; n++) {
				var ne = near[n];

				if (ne[0] < map.size && ne[1] < map.size && ne[0] >= 0 && ne[1] >= 0) {
					var tile = map.map[ne[0]][ne[1]];
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
				var cliff = new THREE.Mesh( geometry.ground, mat );

				cliff.position.y = -0.5 * (g + 1);

				type_cube.add( cliff );
			}

			type_cube.add( cube );

			type_cube.position.add( position );
			group.ground.add( type_cube );

			// Add Terrain Object
			var terrain_cube = new THREE.Group();
			var position = new THREE.Vector3();

			position.x = x*2 - map.size*2/2;
			position.y = here.height*0.5;
			position.z = z*2 - map.size*2/2;

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

							newpos.x = (Math.random() - 0.5) * 1.5;
							newpos.z = (Math.random() - 0.5) * 1.5;

							for (var p = 0; p < poslist.length; p++) {
								var po = poslist[p];

								if (newpos.distanceTo(po) <= 1) {
									tooclose = true;
									break;
								}
							}

							wood_group.position.x = newpos.x;
							wood_group.position.z = newpos.z;

							loopcount += 1;
							if (loopcount >= 10)
								break;
						} while (tooclose);

						poslist.push( new THREE.Vector3().copy( wood_group.position ) );

						// Wood
						var rand = Math.random();

						var wood_mesh = new THREE.Mesh( geometry.box, material.tree_wood );

						var density = 0.05;	//+ter.density/2
						var height = 0.5;	//+ter.density/2

						if (rand >= 0.8) {
							height += ter.density/4;
							density += ter.density/6;
						}

						wood_mesh.scale.set( density, height, density );

						wood_mesh.position.y = 0.25 + (height / 2);

						wood_group.add( wood_mesh );

						// Leaf
						var leaf_mesh = new THREE.Mesh( geometry.box, material.tree_leaf );

						var density = 0.5;	//+ter.density*1.3

						if (rand >= 0.8) {
							density += ter.density/2;
						}

						leaf_mesh.scale.set( density, density, density );

						leaf_mesh.position.y = 0.25 + height;

						wood_group.add( leaf_mesh );

						terrain_cube.add( wood_group );
					}
				}
			}

			if (terrain_cube) {
				terrain_cube.position.add( position );
				group.terrain.add( terrain_cube );
			}

			// Add Mineral Object
			var mineral_cube = new THREE.Group();
			var position = new THREE.Vector3();

			position.x = x*2 - map.size*2/2;
			position.y = here.height*0.5;
			position.z = z*2 - map.size*2/2;

			for (var m = 0; m < here.mineral.length; m++) {
				var mi = here.mineral[m];

				if (mi.name == 'steel') {
					var density = 0.2+mi.density*2.5;

					var mineral = new THREE.Mesh( geometry.box, material.steel );

					mineral.scale.set( density, density/4, density );

					mineral.position.y = 0.25;

					mineral_cube.add( mineral );
				}
			}

			if (mineral_cube) {
				mineral_cube.position.add( position );
				group.mineral.add( mineral_cube );
			}
		}
	}
}	// Map Init Function End
