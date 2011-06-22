var core = require("../dep/Nu-Q/src/NuQCore.js"),
	_ = require('util'),
	wrapper = require('./wrapper.js'),
	Session = require('./Session.js'),
	Node = require('./Node.js'),
	Repository;

function Repository(config, callback) {
	var self = this;
	this.nodes = {};
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
    	if (this.nodes[abspath] !== undefined) {
    		callback(null,this.nodes[abspath]);
    	} else {
    		getNodesCollection(function(err, collection){
    			collection.find({path: abspath}).toArray(function(err, items){
    				if (err !== null) {
    					callback(err);
    				}
    				if (items.length === 1) {
    					if (self.nodes[abspath] === undefined)
    						self.nodes[abspath] = new Node(items[0]);
    					callback(null, self.nodes[abspath]);
    				}else if (items.length === 0) {
    					callback(null,undefined);
    				} else {
    					callback("More than one node with the same abspath");
    				}
    			});
    		});
    	}
    };
    /**
     * Implementation specific method
     */
    this.getRootNode = function(callback) {
    	var self = this;
    	if (self.rootNode !== undefined) {
    		return callback(null, self.rootNode);
    	}
    	function createRootNode(callback) {
    		getNodesCollection(function(err, collection){
	    		collection.insert({
	    			path: '/'
	    		}, {safe: true}, function(err, result) {
	    			if (err !== null) {
	    				callback(err);
	    			} else {
	    				getRootNode(callback);
	    			}
	    		});
    		});
    	}
    	function getRootNode(callback) {
    		getNodesCollection(function(err, collection){
	    		collection.find({path: "/"}).toArray(function(err, items){
					if (err !== null) {
						callback(err);
					} else {
						self.rootNode = new Node(items[0]);
						self.nodes['/'] = self.rootNode;
						_.debug("rootNode found: " + _.inspect(self.rootNode)); 
						callback(null, self.rootNode);
					}
				});
    		});
    	}
    	getNodesCollection(function(err, collection){
    		collection.count(function(err, count) {
				if (count === 0) {
					_.log("Empty repository, creating RootNode");
					collection.createIndex([['path', 1]], true, function(err, result) {
						createRootNode(callback);
					});
				} else {
					getRootNode(callback);
				}
			});
    	});
    };
}
_.inherits(Repository,core.Repository);

module.exports = Repository;