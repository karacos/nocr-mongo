var nocr = require("NoCR"),
	_ = require('util'),
	log4js = require('log4js')(),
	wrapper = require('./wrapper.js'),
	Node = require('./Node.js'),
	Workspace, populateWorkspace, wsproto;

wsproto = {
		getNodeTypeManager: function() {
			return nodeTypeManager;
		},
		getName: function() {
			return this.name;
		}
};
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
		var k;
		if (data === undefined) {
			data = {name: 'default'};
		}
		self.name = data.name;
		self.logger = log4js.getLogger("nocr-mongo.Workspace." + self.name);
		self.session = session;
		callback(null, self);
		for (k in wsproto) {
			self[k] = wsproto[k];
		}
	}
	
	function getInstanciateNode(abspath, callback) {
		function instanciateNode(err, nodeData) {
			var node;
			if (err !== null) {
				console.log(err);
				callback(err);
			}
			nodeData.path = abspath;
			node = new Node(nodeData, session);
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
			property = new Property(propertyData, session);
			self.properties.setProperty(abspath, property, function(err, property){
				callback(null, property);
			});
		}
		return Property;
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
		function indexRootNode(err, rootNodeData) {
			var rootNode = new Node(rootNodeData, session);
			self.logger.debug("Indexing rootNode");
			//_.log(_.inspect(rootNode));
			itemsIndex.insert({
				'item:id': rootNode.data._id.toString(),
				'item:type': 'Node',
				'item:path': "/"
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
		session.getRepository().getRootNodeData(indexRootNode);
	}
	/**
	 * Cache object for nodes instances
	//TODO: this is a raw in-memory cache. for current session
	// It may use some library dependency and/or allow a shared cache (if it make sense ?).
	// anyway, it can be overridden by top-level caller for the most flexible use.
	 */
	session.items = {
			data: {},
			setItem: function(abspath, item, callback) {
				this.data[item.getPath()] = item;
				if (typeof callback === "function")
					callback(null, item);
			},
			getItem: function(abspath,callback) {
				self.logger.debug("getting " + abspath);
				//self.logger.trace(_.inspect(this.data));
				if (abspath in this.data && this.data[abspath] !== undefined) {
					callback(null, this.data[abspath]);
				} else {
					callback("Item not found in cache");
				}
			}
	};
	self.nodes = {
			setNode: function(abspath, node, callback) {
				session.items.setItem(node.getPath(), node,callback);
			},
			getNode: function(abspath,callback) {
				session.items.getItem(abspath, callback);
			}
		};
	self.properties = {
			setProperty: function(abspath, property, callback) {
				session.items.setItem(property.getPath(),callback);
			},
			getProperty: function(abspath,callback) {
				session.items.getItem(abspath, callback);
			}
		};
	// Defining session access methods here..
	session.getItem = function(abspath,callback) {
		session.items.getItem(abspath, function(err, item) {
			if (item !== undefined) {
				callback(err, item);
			} else {
				getItemsIndex(function(err, itemsIndex){
					itemsIndex.find({'item:path': abspath}).toArray(function(err, items){
						if (err !== null) {
							callback(err);
						}
						if (items.length === 1) {
							self.logger.debug('Found Index : ' + _.inspect(items[0]));
							if (items[0]['item:type'] === 'Node') {
								self.nodes.getNode(abspath, function(err, node) {
									if (node !== undefined) {
										callback(null,node);
									} else {
										repository.getDataById(items[0]['item:id'], getInstanciateNode(abspath, callback));
									}
								});
							} else if (items[0]['item:type'] === 'Property') { // This is an Property
								self.properties.getProperty(abspath, function(err, property) {
									if (property !== undefined) {
										callback(null,property);
									} else {
										repository.getDataById(items[0]['item:id'], getInstanciateProperty(abspath, callback));
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
			}
		});
	};
	session.itemExists = function(abspath, callback) {
		session.items.getItem(abspath, function(err, item) {
			if (item !== undefined) {
				callback(null, true);
			} else {
				getItemsIndex(function(err, itemsIndex){
					itemsIndex.find({'item:path': abspath, 'item:type':'Node'}).toArray(function(err, items){
						if (items.length === 1) {
							callback(null, true);
						} else if (items.length === 0) {
							callback(null, false);
						} else {
							callback("Integrity problem");
						}
					});
				});
			}
		});
	};
	session.getNode = function(abspath,callback) {
    	self.nodes.getNode(abspath, function(err, node) {
    		if (node !== undefined) {
    			callback(null,node);
    		} else {
    			getItemsIndex(function(err, itemsIndex){
    				itemsIndex.find({'item:path': abspath, 'item:type':'Node'}).toArray(function(err, items){
    					if (err !== null) {
    						callback(err);
    					}
    					if (items.length === 1) {
    						self.logger.debug('Found Index : ' + _.inspect(items[0]));
							repository.getDataById(items[0]['item:id'], getInstanciateNode(abspath, callback));
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
	    	itemsIndex.find({'item:path': abspath, 'item:type':'Node'}).toArray(function(err, items){
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
	    	itemsIndex.find({'item:id': nodeId, 'item:type': 'Node'}).toArray(function(err, items){
	    		self.logger.debug("found item :" + _.inspect(items));
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

_.inherits(Workspace,nocr.Workspace);
module.exports = Workspace;