(function(){

	"use strict";

	var $ = function(selector){
		return document.querySelector(selector);
	};
	var $$ = function(selector){
		return document.querySelectorAll(selector);
	};

	var brownieViewer = new BrownieViewer({
		canvas: $("#brownieViewer")
	});

	// allow adding random voxels
/*	$("#randVox").addEventListener("click", function(){
		brownieViewer.updateBrownie([[
			randWholeNumber(-10, 10),
			randWholeNumber(-10, 10),
			randWholeNumber(-10, 10)
		]]);
	});

	function randWholeNumber(min, max){
		return Math.floor((Math.random()*max) + min);
	}

	window.mainBrownieViewer = brownieViewer;*/


	// setup raster grid using divs
	// TODO - use canvas or maybe svg?
	var rasterGridEl = $("#rasterGrid"),
		rasterGridContents = [],
		RES_X = 10,
		RES_Y = 10,
		sliceSelectorEl = $("#sliceSelector");

	for(var x = 0; x < RES_X; x++){
		rasterGridContents.push("<div class='pixelRow'>");
		for(var y = 0; y < RES_Y; y++){
			rasterGridContents.push("<div class='pixel' data-x='"+ x +"' data-y='"+ y +"'></div>")
		}
		rasterGridContents.push("</div>");
	}

	rasterGridEl.innerHTML = rasterGridContents.join(" ");

	// listen for clicks
	rasterGridEl.addEventListener("click", function(e){
		var slice = sliceSelectorEl.value;

		// determine which dude was clicked and toggle
		// him on/off
		e.target.classList.add("set");

		// update the brownie
		brownieViewer.updateBrownie([[+e.target.dataset.x, +e.target.dataset.y, +slice]]);
	});

	// on slice change, clear all set pixels
	// TODO - get pixels at the newly selected slice
	// from the brownie
	sliceSelectorEl.addEventListener("change", function(e){
		Array.prototype.forEach.call($$(".pixel"), function(pixelEl){
			pixelEl.classList.remove("set");
		});
	});


})();
