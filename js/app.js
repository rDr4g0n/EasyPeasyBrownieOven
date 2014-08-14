(function(){

	"use strict";

	var brownieViewer = new BrownieViewer({
		canvas: document.getElementById("brownieViewer")
	});

	brownieViewer.updateBrownie([
		[1,1,1],
		[1,2,1],
		[1,3,1],
		[2,1,1],
		[2,2,1],
		[2,3,1]
	]);


})();
