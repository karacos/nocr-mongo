var core = require("../dep/Nu-Q/src/NuQCore.js"),
	_ = require('util'),
	wrapper = require('./wrapper.js'),
	Node = require('./Node.js'),
	Workspace, populateWorkspace;
/**
 * 
 */
function Workspace(session, data, callback) {
	var
		self = this,
		repository = session.getRepository(),
		client = repository.client
		;
	
	function initWorkspace() {
		if (data === undefined) {
			data = {name: 'default'};
		}
		self.name = data.name;
		self.session = session;
		callback(null, self);
	}
	
	function getNodesIndex(callback) {
		if (self.nodesIndex !== undefined) {
			callback(null, self.nodesIndex);
		} else {
			client.collection('workspace.' + self.name + '.nodesIndex', function(err, nodesIndex) {
				self.nodesIndex = nodesIndex;
				self.nodesIndex.count(function(err, count) {
					if (count === 0 ) {
						populateWorkspace(nodesIndex, callback);
					} else {
						callback(err, nodesIndex);
					}
				});
			});
		}
	}
	
	function populateWorkspace(nodesIndex, callback) {
		function indexRootNode(err, rootNode) {
			_.debug("Indexing rootNode");
			_.log(_.inspect(rootNode));
			nodesIndex.insert({
				'node_id': rootNode._id,
				'childrens': [],
				'path': "/"
			}, {safe: true}, function(err, result) {
				console.log(result);
    			if (err !== null) {
    				callback(err);
    			} else {
    				callback(err, nodesIndex);
    			}
    		});
		}
		session.getRepository().getRootNode(indexRootNode);
	}
	/**
	 * Cache object for nodes instances
	//TODO: this is a raw in-memory cache.
	// It may use some library dependency and/or allow a shared cache (if it make sense ?).
	// anyway, it can be overridden by top-level caller for the most flexible use.
	 */
	self.nodes = {
			data: {},
			setNode: function(abspath, node, callback) {
				this.data[node.getPath()] = node;
				callback(null, node);
			},
			getNode: function(abspath,callback) {
				callback(null, this.data[abspath]);
			}
		};
	session.getNode = function(abspath,callback) {
    	self.nodes.getNode(abspath, function(err, node) {
    		if (node !== undefined) {
    			callback(null,node);
    		} else {
    			getNodesIndex(function(err, nodesIndex){
    				nodesIndex.find({'path': abspath}).toArray(function(err, items){
    					if (err !== null) {
    						callback(err);
    					}
    					if (items.length === 1) {
    						console.log(items[0]);
    						repository.getDataById(items[0].node_id, function(err, nodeData) {
    							nodeData.path = abspath;
    							self.nodes.setNode(abspath,new Node(nodeData), function(err, node){
    								callback(null, node);
    							});
    						});
    					} else if (items.length === 0) {
    						callback(null,undefined);
    					} else {
    						callback("More than one node with the same abspath");
    					}
    				});
    			});
    		}
    		
    	});
    };
	initWorkspace();
}


_.inherits(Workspace,core.Workspace);

module.exports = Workspace;