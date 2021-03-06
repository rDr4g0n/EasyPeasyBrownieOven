(function(){
	"use strict";

	/**
	 * A model that emits events when it changes, allowing
	 * many different objects to observe it
	 */
	function BrownieModel(config){

		var id = config.id,
			name = config.name,
			height = config.height,
			width = config.width,
			depth = config.depth;

		// mixin event emitting superpowers
		eventEmitter.call(this);

		// TODO - more legit id
		this.id = id || new Date().getTime();

		this.name = name;
		
		// currently these values are modely just hints
		this.width = width;
		this.height = height;
		this.depth = depth;

		this.onChange = this.onChange.bind(this);

		this.initModel({});
	}

	BrownieModel.prototype = {
		constuctor: BrownieModel,

		initModel: function(model){

			if(this.model){
				Object.unobserve(this.model, this.onChange);
			}

			// TODO - this.model.model is kinda icky to type
			this.model = model;

			// begin observing the model for changes
			Object.observe(this.model, this.onChange);
		},

		// TODO - make onChange function for add, delete and edit
		onChange: function(changes){
			// general change event with no details
			this.emit("change");

			var brownieChangeset = [];

			// find out waht the changes were and tell
			// the brownie viewer to set/unset those vox
			changes.forEach(function(change){
				// TODO - handle delete in a separate
				// mutation observer
				if(change.type === "delete"){
					// TODO - is using nulls to trigger delete here hacky?
					brownieChangeset.push(this.parseKey(change.name).concat([null, null, null]));

				// otherwise, set pixel with color
				} else {
					brownieChangeset.push(this.parseKey(change.name).concat(this.hexColorToBrownieColor(change.object[change.name])));
				}
			}.bind(this));

			// changeset event with a set of changes made
			this.emit("changeset", brownieChangeset);
		},

		// returns all points for a slice
		// TODO - take slice axis as an arg
		// TODO - this is probably expensive...
		getSlice: function(slice){
			var coordsArr,
				// 0 is x, 1 is y, 2 is z
				sliceAxis = 2,
				sliceData = [];
			for(var coords in this.model){
				coordsArr = this.parseKey(coords);

				// if this px is on the specified slice
				if(coordsArr[sliceAxis] === slice){
					// TODO - return hex color instead of brownie color?
					sliceData.push(coordsArr.concat(this.hexColorToBrownieColor(this.model[coords])));
				}
			}
			return sliceData;
		},

		// returns [x,y,z] from a model key
		parseKey: function(key){
			return key.split(",").map(function(key){ return +key; });
		},
		// creates model key from [x,y,z] coords
		createKey: function(coords){
			return coords.join(",");
		},

		// takes hex color like "#FF0000" and normalizes to
		// 3 zero to one values. eg FF0000 becomes 1, 0, 0
		hexColorToBrownieColor: function(hex){
			var normalized = [];

			hex = hex.replace("#", "");
			for(var i = 0; i < 6; i+=2){
				normalized.push(parseInt(hex.substr(i, 2), 16) / 255);
			}

			return normalized;
		},

		export: function(){
			return {
				id: this.id,
				name: this.name,
				width: this.width,
				height: this.height,
				depth: this.depth,
				data: this.model
			};
		},
		import: function(data){
			this.initModel(data);
		}
	};

	window.BrownieModel = BrownieModel;
	
})();
