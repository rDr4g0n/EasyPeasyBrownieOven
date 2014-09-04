(function(){

	"use strict";

	/**
	 * Creates a threejs rendering context in the provided
	 * canvas and displays a single brownie voxel thingy
	 */
	function BrownieViewer(config){
		config = config || {};

		this.initModel(config.model);

		// TODO - ensure el exists
		this.el = config.el;

		this.canvas = document.createElement("canvas");
		
		this.renderer = new THREE.WebGLRenderer({
			canvas: this.canvas
		});

		this.resizeCanvas();
		this.el.appendChild(this.canvas);

		this.camera = new THREE.PerspectiveCamera(65, this.canvas.width / this.canvas.height, 1, 1000);
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
			})
		};

		// cursor hint voxel
		this.meshes["cursor"] = new THREE.Mesh(
			new THREE.CubeGeometry(1, 1, 1),
			this.materials["cursor"]
		);

		// base brownie
		this.newBrownie();

		// auto-rotate meshes
		this.autoRotateMesh = this.autoRotateMesh.bind(this);
		this.autoRotateMesh();
	}

	BrownieViewer.prototype = {
		constructor: BrownieViewer,

		newBrownie: function(){
			this.brownies["brownie"] = new Brownie(this.renderer);
			var geo = this.brownies["brownie"].getGeometry();
			
			// remove previous brownie mesh before updating
			this.scene.remove(this.meshes["brownie"]);

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
			delete this.brownies["slice"];

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
		},

		resizeCanvas: function(){
			this.canvas.width = Math.min(this.el.clientHeight, this.el.clientWidth);
			this.canvas.height = Math.min(this.el.clientHeight, this.el.clientWidth);
			this.renderer.setSize(Math.min(this.el.clientHeight, this.el.clientWidth), Math.min(this.el.clientHeight, this.el.clientWidth));
		},

		// sets model and makes any model related configs
		initModel: function(model){
			this.model = model;
			this.model.on("changeset", this.updateBrownie, this);
		},

		// cleans up old state and loads a new brownie
		loadBrownie: function(model){
			var changeset = [];

			this.initModel(model);
			this.newBrownie();

			// TODO - iterate model and create a brownie
			// changeset

			this.updateBrownie(changeset);

			// update camera position with new height/depth
			this.camera.position.set(0, -this.model.height, this.model.depth);
		}
	}

	window.BrownieViewer = BrownieViewer;

})();