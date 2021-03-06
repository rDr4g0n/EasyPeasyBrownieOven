(function(){

    /* BrownieOven.js
     * Creates the BrownieOven app and
     * stores its state
     */
    function BrownieOven(){
        this.editors = [];       
        this.undoQueue = new UndoQueue();
    }

    BrownieOven.prototype = {
        constructor: BrownieOven,

        createEditor: function(config){
            // TODO - dont directly edit user's config?
            config.model = this.model;
            
            this.editors.push(new SliceEditor(config));
        },

        createModel: function(config){
            // TODO - destroy existing model
            this.setModel(new BrownieModel(config));
        },

        createView: function(config){
            // TODO - dont directly edit user's config?
            config.model = this.model;
           
            this.viewer = new BrownieViewer(config); 
            // TODO - ideally new BrownieViewer would load the model
            this.viewer.loadBrownie(this.model);
        },

        createToolBox: function(config){
            config.editors = this.editors;
            config.brownieViewer = this.viewer;

            // TODO - destroy existing toolbox
            this.toolbox = new Toolbox(config);
        },

        setModel: function(model){
            // TODO - unlisten to old model changes
            this.model = model;

            this.model.on("change", this.saveToLS.bind(this));
        },

        resizeAllViews: function(){
            this.editors.forEach(function(sliceEditor){
                sliceEditor.resizeCanvas();
            });
            this.viewer.resizeCanvas();
        },

        loadBrownie: function(brownieModel){
            // TODO - properly destroy this.model
            this.setModel(brownieModel);
            this.editors.forEach(function(sliceEditor){
                sliceEditor.loadBrownie(brownieModel);
            });
            this.viewer.loadBrownie(brownieModel);

            this.undoQueue.clear();
        },

		saveToLS: function(){
			var localStore = JSON.parse(localStorage.EasyPeasyBrownieOven || "{}");
	
			localStore.brownies = localStore.brownies || {};

			// TODO - ensure this doesnt exceed local storage size limitation
			localStore.brownies[this.model.id] = this.model.export();

			localStorage.EasyPeasyBrownieOven = JSON.stringify(localStore);
		},
        deleteFromLS: function(){
			var localStore = JSON.parse(localStorage.EasyPeasyBrownieOven || "{}");
			
			localStore.brownies = localStore.brownies || {};

			delete localStore.brownies[this.model.id];

			localStorage.EasyPeasyBrownieOven = JSON.stringify(localStore);
        }
    };

    window.BrownieOven = BrownieOven;

})();
