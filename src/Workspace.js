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
		self.id = data['_id'];
		self.logger = log4js.getLogger("nocr-mongo.Workspace");
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
				self.logger.error(err);
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
				self.logger.error(err);
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
			client.collection('workspace.' + self.id + '.itemsIndex', function(err, itemsIndex) {
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
			self.logger.trace(_.inspect(rootNode));
			itemsIndex.insert({
				'item:id': rootNode.data._id.toString(),
				'item:type': 'Node',
				'item:path': "/"
			}, {safe: true}, function(err, result) {
				self.logger.trace(result);
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
				self.logger.trace(_.inspect(this.data));
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
    
    /**
     * API method
     */
    session.getNodeByIdentifier = function(nodeId, callback) {
    	// TODO: use cache object
    	getItemsIndex(function(err, itemsIndex){
	    	itemsIndex.find({'item:id': nodeId, 'item:type': 'Node'}).toArray(function(err, items){
	    		self.logger.trace("found item :" + _.inspect(items));
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
    
    /**
     * api method for saving content which remains to the session
     */
    session.save = function(callback) {
    	var 
    		modifiedNodes = [],
    		newNodes = [];
    	if (callback === undefined) { // Default callback throws an exception
    		callback = function(err,res) {
    			if (err !== null) {
    				throw new Error(err);
    			}
    		};
    	}
    	for (path in session.items.data) {
    		if (session.items.data[path] instanceof nocr.Node && session.items.data[path].isnew) {
    			newNodes.push(session.items.data[path]);
    		} else if (session.items.data[path] instanceof nocr.Node && session.items.data[path].ismodified) {
    			modifiedNodes.push(session.items.data[path]);
    		}
    	}
    	
    	
    	function updateIndex(callback) {
    		
    	}
    	repository.getItemsCollection(function(err, itemsCollection) {
    		/**
    		 * Insert in database new properties of node
    		 */
    		function insertNodeProperties(node, callback) {
				var propscount,
					propsmap = {},
					insertedprops = 0,
					propdata = {}, k,
					propkey;
				self.logger.debug("start inserting node properties");
				self.logger.trace(_.inspect(node));
				Object.keys(node['properties']).forEach(function(index) { //iterate over each node property
					var property = node['properties'][index];
					if (property.isnew) {
						propsmap[index] = node['properties'][index];
					} //build a map of properties to insert
				});
				propscount = Object.keys(propsmap).length;
				self.logger.debug(propscount + " Properties to insert");
				if (propscount === 0) {
					callback(null, node);
				} else {
					self.logger.trace(_.inspect(propsmap));
					for (propkey in propsmap) { // iterate over each property
						propdata = {};
						for (k in  propsmap[propkey].data) {
							if (k !== 'path') {
								propdata[k] = propsmap[propkey].data[k];
							}
						}
						propdata['item:type'] = 'Property';
						itemsCollection.insert(propdata,{safe:true},function(err, pdata){
							if (err !== null) {
								callback(err);
							} else {
								propsmap[propkey].data['_id'] = pdata._id;
								propsmap[propkey].isnew = false;
								propsmap[propkey].isModified = false;
								node['node:properties'][propkey] = pdata._id;
								self.logger.debug('Inserting property - ' + (insertedprops++) + "/" + propscount);
								if (insertedprops === propscount) {
									callback(err, node);
								}
							}
						});
					}
				}
			}
    		function updateNodeProperties(node, callback) {
				var propscount,
					propsmap = {},
					insertedprops = 0,
					propdata = {}, k, propkey;
				self.logger.debug("start updating node properties");
				Object.keys(node['properties']).forEach(function(index) {
					var property = node['properties'][index];
					if (property.ismodified && !property.isnew) {
						propsmap[index] = node['properties'][index];
					}
				});
				propscount = Object.keys(propsmap).length;
				self.logger.debug(propscount + " Properties to update");
				if (propscount === 0) {
					callback(null, node);
				} else {
					for (propkey in propsmap) {
						for (k in  propsmap[propkey].data) {
							if (k !== 'path') {
								propdata[k] = propsmap[propkey].data[k];
							}
						}
						propdata['item:type'] = 'Property';
						itemsCollection.update({"_id":propdata['_id']}, propdata,{safe:true},function(err, pdata){
							propsmap[propkey].data['_id'] = pdata._id;
							propsmap[propkey].isnew = false;
							propsmap[propkey].isModified = false;
							node['node:properties'][propkey] = pdata._id;
							if (++insertedprops === propscount) {
								callback(err, node);
							}
						});
					}
				}
			}
	    	/**
	    	 * 
	    	 */
	    	function insertNodes(callback) {
	    		var insertedNodesCount = 0, node, propertyName, properties = [];
	    		function insertNode(node, callback) { // insert a Node and its properties
	    			insertNodeProperties(node, function(err, node) {
	    				if (err !== null) {
	    					callback(err);
	    				} else {
	    					var nodeData = {}, k;
	    					for (k in node.data) {
	    						if (k !== 'path') {
	    							nodeData[k] = node.data[k];
	    						}
	    					}
	    					nodeData['node:properties:' + self.getName()] = node['node:properties'];
	    					nodeData['node:childrens:' + self.getName()] = node['node:childrens'];
	    					nodeData['item:type'] = 'Node';
	    					self.logger.debug("Inserting node");
	    					self.logger.debug(_.inspect(nodeData));
	    					itemsCollection.insert(nodeData,{safe:true},function(err, ndata){
	    						self.logger.debug("Inserted node : " + node.path);
	    						node['data']['_id'] = ndata._id;
	    						node.isnew = false;
	    						node.isModified = false;
	    						callback(err,node);
	    					});
	    				}
	    			});
	    		}
	    		if (newNodes.length === 0) {
	    			self.logger.debug("No nodes to insert");
	    			callback(null, {'message': "No nodes to insert",
	    							"createdNodes": 0});
	    		} else {
    	    		newNodes.forEach(function(node, nk) {
    	    			self.logger.debug("start inserting node " + nk);
        				insertNode(node, function(err, node) {
        					self.logger.trace(_.inspect(err));
        					self.logger.debug("insertedNodesCount " + (++insertedNodesCount) + "/" + newNodes.length);
        					if (insertedNodesCount === newNodes.length) {
        						callback(err, {'message': "Nodes inserted",
	    							"createdNodes": newNodes.length});
        					}
        				});
        			});
	    		}
	
	    	} // ------------------------------ /function InsertNodes
	    	function updateNodes(callback) {
	    		var updatedNodescount = 0, node, propertyName, properties = [];
	    		function updateNode(node, callback) { // insert a Node and its properties
	    			insertNodeProperties(node, function(err, node) {
	    				if (err !== null) {
	    					self.logger.error("Error inserting properties");
	    					self.logger.error(_.inspect(err));
	    					callback(err);
	    				} else {
	    					updateNodeProperties(node, function(err, node) {
	    						if (err !== null) {
	    							callback(err);
	    						} else {
	    							var nodeData = {}, k;
	    							for (k in node.data) {
	    								if (k !== 'path') {
	    									nodeData[k] = node.data[k];
	    								}
	    							}
	    							nodeData['node:properties:' + self.getName()] = node['node:properties'];
	    							nodeData['node:childrens:' + self.getName()] = node['node:childrens'];
	    							nodeData['item:type'] = 'Node';
	    							self.logger.debug("Data prepared for Node update");
	    							self.logger.trace(_.inspect(nodeData));
	    							self.logger.trace(_.inspect(node));
	    							itemsCollection.update({"_id": nodeData['_id']},nodeData,{safe:true},function(err, ndata){
	    								self.logger.debug("Node data updated");
	    								self.logger.trace(_.inspect(ndata));
	    								if (err !== null) {
	    									callback(err);
	    								} else {
	    									node['data']['_id'] = ndata._id;
	    									node.isnew = false;
	    									node.isModified = false;
	    									callback(err, node);
	    								}
	    							});
	    						}
	    					});
	    				}
	    			});
	    		} // ------------------------------ /function updateNode
	    		self.logger.debug(modifiedNodes.length + " Nodes to update");
	    		if (modifiedNodes.length === 0) {
	    			callback(null,{'message': "No nodes to update",
						"updatedNodes": 0});
	    		} else {
	    			modifiedNodes.forEach(function(node) {
	    				self.logger.debug("Updating " + node.getPath());
        				updateNode(node, function(err, node) {
        					if (err !== null) {
        						callback(err);
        					} else {
        						self.logger.debug('Updated node - ' + (++updatedNodescount) + "/" + modifiedNodes.length);
        						if (updatedNodescount === modifiedNodes.length) {
        							callback(err, {'message': "Nodes updated",
        								"updatedNodes": updatedNodescount});
        						}
        					}
        				});
        			});
	    		}
	    	} //------------------------------ /function updateNodes
	    	
	    	// process Node
	    	insertNodes(function(err, insertRes) {
	    		if (err === null) {
	    			updateNodes(function(err, updateRes) {
	    				if (err === null) {
	    					var result = {
	    							'message': "Session.save() - operation successed",
	    							'createdNodes': insertRes['createdNodes'],
	    							"updatedNodes": updateRes['updatedNodes']
	    					};
	    					self.logger.debug(_.inspect(result));
	    					callback(null, result);
	    				} else {
	    					callback(err);
	    				}
	    			});
	    		} else {
	    			callback(err);
	    		}
	    	});
    	});

    };
    
	initWorkspace();
}

_.inherits(Workspace,nocr.Workspace);
module.exports = Workspace;