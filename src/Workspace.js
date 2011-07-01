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
	
	function getInstanciateNode(abspath, callback) {
		function instanciateNode(err, nodeData) {
			var node;
			if (err !== null) {
				console.log(err);
				callback(err);
			}
			nodeData.path = abspath;
			node = new Node(nodeTypeManager.getNodeType(nodeData['primaryNodeType']),nodeData);
			self.nodes.setNode(abspath, node, function(err, node){
				callback(null, node);
			});
		}
		return instanciateNode;
	}
	
	function getInstanciateProperty(abspath, callback) {
		function instanciateProperty(err, propertyData) {
			var property;
			if (err !== null) {
				console.log(err);
				callback(err);
			}
			propertyData.path = abspath;
			property = new Property(propertyData);
			self.properties.setProperty(abspath, property, function(err, property){
				callback(null, property);
			});
		}
		return Property;
	}
	
	function initWorkspace() {
		if (data === undefined) {
			data = {name: 'default'};
		}
		self.name = data.name;
		self.session = session;
		callback(null, self);
	}
	
	function getItemsIndex(callback) {
		if (self.itemsIndex !== undefined) {
			callback(null, self.itemsIndex);
		} else {
			client.collection('workspace.' + self.name + '.itemsIndex', function(err, itemsIndex) {
				self.itemsIndex = itemsIndex;
				self.itemsIndex.count(function(err, count) {
					if (count === 0 ) {
						populateWorkspace(itemsIndex, callback);
					} else {
						callback(err, itemsIndex);
					}
				});
			});
		}
	}
	
	function populateWorkspace(itemsIndex, callback) {
		function indexRootNode(err, rootNode) {
			_.debug("Indexing rootNode");
			//_.log(_.inspect(rootNode));
			itemsIndex.insert({
				'item_id': rootNode.data._id.toString(),
				'type': 'Node',
				'path': "/"
			}, {safe: true}, function(err, result) {
				console.log(result);
    			if (err !== null) {
    				callback(err);
    			} else {
    				self.nodes.setNode('/',rootNode,
					function() {
    					callback(null, itemsIndex);
    				});
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
	self.properties = {
			data: {},
			setProperty: function(abspath, property, callback) {
				this.data[property.getPath()] = property;
				callback(null, node);
			},
			getProperty: function(abspath,callback) {
				callback(null, this.data[abspath]);
			}
		};
	session.getItem = function(abspath,callback) {
		getItemsIndex(function(err, itemsIndex){
			itemsIndex.find({'path': abspath}).toArray(function(err, items){
				if (err !== null) {
					callback(err);
				}
				if (items.length === 1) {
					_.debug('Found Index : ' + _.inspect(items[0]));
					if (items[0]['type'] === 'Node') {
						self.nodes.getNode(abspath, function(err, node) {
							if (node !== undefined) {
								callback(null,node);
							} else {
								repository.getDataById(items[0].item_id, getInstanciateNode(abspath, callback));
							}
						});
					} else if (items[0]['type'] === 'Property') { // This is an Property
						self.properties.getProperty(abspath, function(err, property) {
							if (property !== undefined) {
								callback(null,property);
							} else {
								repository.getDataById(items[0].item_id, getInstanciateProperty(abspath, callback));
							}
						});
					}
				} else if (items.length === 0) {
					callback("No Item found at path " + abspath,undefined);
				} else {
					callback("More than one item with the same abspath");
				}
			});
		});
	};
	session.itemExists = function(abspath, callback) {
		getItemsIndex(function(err, itemsIndex){
			itemsIndex.find({'path': abspath, 'type':'Node'}).toArray(function(err, items){
				if (items.length === 1) {
					callback(null, true);
				} else if (items.length === 0) {
					callback(null, false);
				} else {
					callback("Integrity problem");
				}
			});
		});
	};
	session.getNode = function(abspath,callback) {
    	self.nodes.getNode(abspath, function(err, node) {
    		if (node !== undefined) {
    			callback(null,node);
    		} else {
    			getItemsIndex(function(err, itemsIndex){
    				itemsIndex.find({'path': abspath, 'type':'Node'}).toArray(function(err, items){
    					if (err !== null) {
    						callback(err);
    					}
    					if (items.length === 1) {
    						_.debug('Found Index : ' + _.inspect(items[0]));
							repository.getDataById(items[0].item_id, getInstanciateNode(abspath, callback));
    					} else if (items.length === 0) {
    						callback("No Node found at path " + abspath,undefined);
    					} else {
    						callback("More than one node with the same abspath");
    					}
    				});
    			});
    		}
    	});
    };
    session.nodeExists = function(abspath,callback) {
    	getItemsIndex(function(err, itemsIndex){
	    	itemsIndex.find({'path': abspath, 'type':'Node'}).toArray(function(err, items){
	    		if (items.length === 1) {
					callback(null, true);
				} else if (items.length === 0) {
					callback(null, false);
				} else {
					callback("Integrity problem");
				}
	    	});
    	});
    };
    session.getNodeByIdentifier = function(nodeId, callback) {
    	getItemsIndex(function(err, itemsIndex){
	    	itemsIndex.find({'item_id': nodeId, 'type': 'Node'}).toArray(function(err, items){
	    		_.debug("found item :" + _.inspect(items));
	    		if (items.length === 1) {
	    			repository.getDataById(nodeId, getInstanciateNode(items[0]['path'], callback));
				} else if (items.length === 0) {
					callback("No node found with this identifier", null);
				} else {
					callback("Integrity problem", null);
				}
	    	});
    	});
    };
	initWorkspace();
}


_.inherits(Workspace,core.Workspace);
Workspace.prototype = {
		getNodeTypeManager: function() {
			return nodeTypeManager;
		}
};
module.exports = Workspace;