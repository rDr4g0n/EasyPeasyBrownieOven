(function(){

	"use strict";

	/**
	 * Creates a threejs rendering context in the provided
	 * canvas and displays a single brownie voxel thingy
	 */
	function BrownieViewer(config){
		config = config || {};

		this.model = config.model;
		this.model.on("changeset", this.updateBrownie, this);

		// TODO - ensure canvas exists
		this.canvas = config.canvas;

		// TODO - probably a better way to set width/height
		this.canvas.width = +this.canvas.dataset["width"];
		this.canvas.height = +this.canvas.dataset["height"];
		
		this.renderer = new THREE.WebGLRenderer({
			canvas: this.canvas
		});

		// TODO - use model dimensions to position camera better
		this.camera = new THREE.PerspectiveCamera(75, this.canvas.width / this.canvas.height, .1, 100);
		this.camera.position.set(0, -this.model.height, this.model.depth);

		this.light = new THREE.PointLight(0xFFFFFF);
		this.light.position = this.camera.position.clone();

		this.scene = new THREE.Scene();
		this.scene.add(this.light);

		this.brownies = {};
		this.meshes = {};
		this.materials = {
			brownie: new THREE.MeshPhongMaterial({
				color: 0xFFFFFF,
				vertexColors: THREE.VertexColors,
				specular: 0
			}),
			cursor: new THREE.MeshBasicMaterial({
				wireframe: true,
				wireframeLinewidth: 3,
				color: "#4CE806"
			}),
			brownieTransparent: new THREE.MeshPhongMaterial({
				color: 0xFFFFFF,
				vertexColors: THREE.VertexColors,
				specular: 0,
				transparent: true,
				opacity: 0.35
			}),
		};

		// cursor hint voxel
		this.meshes["cursor"] = new THREE.Mesh(
			new THREE.CubeGeometry(1, 1, 1),
			this.materials["cursor"]
		);

		this.newBrownie();

		// auto-rotate meshes
		this.autoRotateMesh = this.autoRotateMesh.bind(this);
		this.autoRotateMesh();
	}

	BrownieViewer.prototype = {
		constructor: BrownieViewer,

		newBrownie: function(brownie){
			this.brownies["brownie"] = new Brownie(this.renderer);
			var geo = this.brownies["brownie"].getGeometry();
			
			// TODO - remove previous brownie's mesh from scene
			this.meshes["brownie"] = new THREE.Mesh(geo, this.materials["brownie"]);

			// add cursor hint
			this.meshes["brownie"].add(this.meshes["cursor"]);

			this.scene.add(this.meshes["brownie"]);
			this.renderScene();
		},

		updateBrownie: function(brownieData){
			// if a slice brownie is available,
			// update it as well
			var slice = this.brownies["slice"];

			brownieData.forEach(function(val){

				// if index 3, 4, and 5 are null, this is a delete
				if(val[3] === null){
					if(slice) slice.unset.apply(null, val);
					this.brownies["brownie"].unset.apply(null, val);

				// otherwise this is an add
				} else {
					if(slice) slice.set.apply(null, val);
					this.brownies["brownie"].set.apply(null, val);
				}

			}.bind(this));
			this.renderBrownie();
		},

		// make brownie translucent and show the
		// current slice
		showSlice: function(sliceData){
			var sliceBrownie = this.brownies["slice"] = new Brownie(this.renderer);

			this.meshes["brownie"].material = this.materials["brownieTransparent"];

			// remove previous slice
			this.meshes["brownie"].remove(this.meshes["slice"]);

			this.meshes["slice"] = new THREE.Mesh(
				sliceBrownie.getGeometry(),
				this.materials["brownie"]
			);

			// add new slice mesh
			this.meshes["brownie"].add(this.meshes["slice"]);

			// update slice mesh
			sliceData.forEach(function(val){
				sliceBrownie.set.apply(null, val);
			});
			sliceBrownie.rebuild();

			this.renderScene();

			// to determine if this thing is
			// sliced or not
			this.sliced = true;
		},

		// restore brownie to original material
		// and remove slice
		unshowSlice: function(){
			this.meshes["brownie"].material = this.materials["brownie"];
			// remove previous slice
			this.meshes["brownie"].remove(this.meshes["slice"]);
			// remove slice brownie
			this.brownies["slice"] = null;

			// to determine if this thing is
			// sliced or not
			this.sliced = false;
		},

		renderBrownie: function(){
			for(var i in this.brownies){
				this.brownies[i].rebuild();
			}
			this.renderScene();
		},

		// TODO - debounce?
		renderScene: function(){
			this.renderer.render(this.scene, this.camera);
		},

		autoRotateMesh: function(){
			// TODO - rotate camera instead of mesh?
			this.meshes["brownie"].rotation.y += 0.01;
			this.renderScene();
			requestAnimationFrame(this.autoRotateMesh);
		},

		updateCursorPosition: function(coords){
			// hide cursor
			if(!coords){
				this.meshes["brownie"].remove(this.meshes["cursor"]);

			// move cursor
			} else {
				this.meshes["brownie"].add(this.meshes["cursor"]);
				this.meshes["cursor"].position.set(coords[0] + 0.5, coords[1] + 0.5, coords[2] + 0.5);
			}
		}
	}

	window.BrownieViewer = BrownieViewer;

})();