var core = require("../dep/Nu-Q/src/NuQCore.js"),
	_ = require('util'),
	wrapper = require('./wrapper.js'),
	Session = require('./Session.js'),
	Node = require('./Node.js'),
	Repository;

function Repository(config, callback) {
	var self = this;
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
    		console.log(err);
    		callback(err);
    	}
    });
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
     * 
     */
    this.getRootNode = function(callback) {
    	var self = this;
    	if (self.rootNode !== undefined) {
    		return callback(null, self.rootNode);
    	}
    	function createRootNode(callback) {
    		self.nodesCollection.insert({
    			path: '/'
    		}, {safe: true}, function(err, result) {
    			if (err !== null) {
    				callback(err);
    			} else {
    				getRootNode(callback)
    			}
    		});
    	}
    	function getRootNode(callback) {
    		self.nodesCollection.find({path: "/"}).toArray(function(err, items){
				if (err !== null) {
					callback(err);
				} else {
					self.rootNode = new Node(items[0]);
					_.debug("rootNode found: " + _.inspect(self.rootNode)); 
					callback(null, self.rootNode);
				}
			});
    	}
    	self.client.collection('repository_nodes', function(err, collection){
    		self.nodesCollection = collection;
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