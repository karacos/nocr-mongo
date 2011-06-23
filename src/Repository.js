var core = require("../dep/Nu-Q/src/NuQCore.js"),
	_ = require('util'),
	wrapper = require('./wrapper.js'),
	Session = require('./Session.js'),
	Node = require('./Node.js'),
	Repository;
/**
 * 
 * @param config an object representing the config:
 * 
 * ```
 * {
 *     'db': { // database parameters
 *       
 *       },
 *     'nodes': { // node cache object handler
 *       getNode: function(abspath,callback) {}, params of callback :(error, Node)
 *       setNode: function(abspath, node, callback) {}: (error, Node) 
 *       }
 *     }
 * ```
 * 
 * @param callback (err, Repository)
 * @returns {Repository}
 */
function Repository(config, callback) {
	var self = this;
	//TODO: this is a raw in-memory cache.
	// It may use some library dependency and/or allow a shared cache (if it make sense ?).
	// anyway, it can be overridden by top-level caller for the most flexible use.
	function getNodesCollection(callback) {
		if (self.nodesCollection !== undefined) {
			callback(null, self.nodesCollection);
		} else {
			self.client.collection('repository_nodes', function(err, collection) {
				if (err === null) {
					self.nodesCollection = collection;
					callback(err, collection);
				} else {
					_.error(err);
					callback(err);
				}
			});
		}
	}
	this.nodes = {
			data: {},
			setNode: function(abspath, node, callback) {
				this.data[node.getPath()] = node;
				callback(null, node);
			},
			getNode: function(abspath,callback) {
				callback(null, this.data[abspath]);
			}
		};
	
    this.login = function(credentials, workspaceName, callback) {
    	var 
    		session = new Session(self,credentials, function(err,sess) {
    			if (callback !== undefined) {
    				callback(err, sess);
    			}
    		});
    };
    
    /**
     * Implementation specific method, drop the repository storage
     */
    this.drop = function(callback) {
    	self.client.dropDatabase(function(err, done) {
    		if (err !== null) {
    			callback(err,done);
    		} else {
    			callback(null,"Database drop command successful, repository deleted");
    		}
    	});
    };
    /**
     * Implementation specific method, gets a node at absolute path
     */
    this.getNode = function(abspath,callback) {
    	var self = this;
    	self.nodes.getNode(abspath, function(err, node) {
    		if (node !== undefined) {
    			callback(null,node);
    		} else {
    			getNodesCollection(function(err, collection){
    				collection.find({path: abspath}).toArray(function(err, items){
    					if (err !== null) {
    						callback(err);
    					}
    					if (items.length === 1) {
    						self.nodes.setNode(abspath,new Node(items[0]), function(err, node){
        						callback(null, node);
    						});
    					}else if (items.length === 0) {
    						callback(null,undefined);
    					} else {
    						callback("More than one node with the same abspath");
    					}
    				});
    			});
    		}
    		
    	});
    };
    /**
     * Implementation specific method
     */
    this.getRootNode = function(callback) {
    	var self = this, abspath = '/';
    	
    	function createRootNode(callback) {
    		getNodesCollection(function(err, collection){
	    		collection.insert({
	    			path: abspath
	    		}, {safe: true}, function(err, result) {
	    			if (err !== null) {
	    				callback(err);
	    			} else {
	    				self.getNode('/',callback);
	    			}
	    		});
    		});
    	}
    	self.getNode('/', function(err, node) {
    		if (node === undefined) {
    			createRootNode(function(err, rootNode){
    				self.nodes.setNode(abspath, rootNode, callback); 
    			});
    		} else {
    			callback(err, node);
    		}
    	});
    };
    // process the repository Initialization
    if (typeof config === "undefined" || config === null) {
        throw new Error("Missing options parameter");
    }
    
    this.config = config;
    wrapper.getClient(config.db, function(err, client){
    	if (err === null) {
    		self.client = client;
    		//console.log(self);
    		callback(null, self);
    	} else {
    		_.error(err);
    		callback(err);
    	}
    });
}
_.inherits(Repository,core.Repository);

module.exports = Repository;