(function(){
	"use strict";

	/**
	 * Raster grid for painting a slice of brownie
	 */
	function SliceEditor(config){

		// mixin event emitting superpowers
		eventEmitter.call(this);

		// TODO - ensure config.canvas
		this.canvas = config.canvas;

		// TODO - probably a better way to set width/height
		this.canvas.width = +this.canvas.dataset["width"];
		this.canvas.height = +this.canvas.dataset["height"];
		this.context = this.canvas.getContext("2d");

		// opacity of layer below the current layer
		this.layerOpacity = config.layerOpacity || .25;

		// TODO - bind model
		this.model = config.model;
		this.model.on("change", this.render, this);

		// determine brownie width
		this.brownieWidth = this.model.width;

		// determine brownie height
		this.brownieHeight = this.model.height;

		// ratio is always square
		this.pxMultiplier = Math.min(this.canvas.width / this.brownieWidth, this.canvas.height / this.brownieHeight);
		
		// bind context for event listeners
		this.onMouseDown = this.onMouseDown.bind(this);
		this.onMouseUp = this.onMouseUp.bind(this);
		this.onDrag = this.onDrag.bind(this);
		this.onMouseWheel = this.onMouseWheel.bind(this);

		// listen for clicksies
		this.canvas.addEventListener("mousedown", this.onMouseDown);
		this.canvas.addEventListener("mouseup", this.onMouseUp);
		this.canvas.addEventListener("mousewheel", this.onMouseWheel);

		this._slice = 0;

		this.render();
	}

	SliceEditor.prototype = {
		constructor: SliceEditor,

		render: function(){

			// draw pixels
			var val, underVal,
				pxMultiplier = this.pxMultiplier;

			// clear canvas
			this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

			this.context.strokeStyle = "#444444";

			for(var x = 0; x < this.brownieWidth; x++){
				for(var y = 0; y < this.brownieHeight; y++){
					val = this.modelGet([x, y, this.getSlice()]);
					underVal = this.modelGet([x, y, this.getSlice() - 1]);

					// if a value should be set here
					if(val){
						this.context.fillStyle = val;
						this.context.fillRect(x * pxMultiplier, y * pxMultiplier, pxMultiplier, pxMultiplier);
					
					// if no value on this layer, but the layer below has something
					} else if(underVal){
						this.context.fillStyle = "rgba(" + hexColorToInt(underVal).join(",") +","+ this.layerOpacity +")";
						this.context.fillRect(x * pxMultiplier, y * pxMultiplier, pxMultiplier, pxMultiplier);

						this.context.strokeStyle = underVal;
						this.context.strokeRect(x * pxMultiplier, y * pxMultiplier, pxMultiplier, pxMultiplier);
						this.context.strokeStyle = "#444444";

					// just draw an empty box, idiot
					} else {
						this.context.strokeRect(x * pxMultiplier, y * pxMultiplier, pxMultiplier, pxMultiplier);
					}
					
				}
			}
		},

		onMouseDown: function(e){
			var px = this.getTouchedPixel(getMousePos(e));
			this.emit("mousedown", px);

			// listen for drag event
			this.canvas.addEventListener("mousemove", this.onDrag);
		},

		onMouseUp: function(e){
			var px = this.getTouchedPixel(getMousePos(e));
			this.emit("mouseup", px);

			// clear listener for drag
			this.canvas.removeEventListener("mousemove", this.onDrag);
		},

		onDrag: function(e){
			var px = this.getTouchedPixel(getMousePos(e));
			this.emit("drag", px);
		},

		onMouseWheel: function(e){
			e.preventDefault();
			if(e.wheelDelta > 0){
				this.incrementSlice();
			} else {
				this.decrementSlice();
			}
			this.render();
		},

		getTouchedPixel: function(mousePos){
			return [
				Math.ceil(mousePos[0] / this.pxMultiplier),
				Math.ceil(mousePos[1] / this.pxMultiplier),
			];
		},
		
		setColor: function(color){
			this.currColor = color;
		},

		modelSet: function(coords, val){
			var translatedCoords = this.translateOrigin(coords);

			// if val is null, delete the value
			if(val === null){
				delete this.model.model[this.model.createKey([translatedCoords[0], translatedCoords[1], translatedCoords[2]])];
			} else {
				this.model.model[this.model.createKey([translatedCoords[0], translatedCoords[1], translatedCoords[2]])] = val;
			}
		},
		modelGet: function(coords){			
			var translatedCoords = this.translateOrigin(coords);
			return this.model.model[this.model.createKey([translatedCoords[0], translatedCoords[1], translatedCoords[2]])];
		},

		translateOrigin: function(coords){
			return [
				coords[0] - (this.brownieWidth * 0.5),
				-coords[1] - (this.brownieHeight * 0.5),
				coords[2]
			];
		},

		getSlice: function(){
			return this._slice;
		},
		setSlice: function(slice){
			// TODO - ensure slice is within bounds
			this._slice = +slice;
			this.render();
		},
		incrementSlice: function(){
			// TODO - clamp
			this._slice++;
		},
		decrementSlice: function(){
			this._slice--;
		},
	}

	// http://stackoverflow.com/a/17108084/957341
	// but modified by me
	function getMousePos(evt){
		var isTouchSupported = 'ontouchstart' in window;

		// for touch devices
		if(isTouchSupported){ 
			return [evt.clientX-containerX, evt.clientY-containerY]

	    //for webkit browser like safari and chrome
		} else if(evt.offsetX || evt.offsetX == 0){
		   	return [evt.offsetX, evt.offsetY];

		// for mozilla firefox
		} else if(evt.layerX || evt.layerX == 0){
			return [evt.layerX, evt.layerY]
		}
	}

	// takes hex color like "#FF0000" and returns an
	// array of [r,g,b] ints
	function hexColorToInt(hex){
		var normalized = [];

		hex = hex.replace("#", "");
		for(var i = 0; i < 6; i+=2){
			normalized.push(parseInt(hex.substr(i, 2), 16));
		}

		return normalized;
	}

	window.SliceEditor = SliceEditor;

})();