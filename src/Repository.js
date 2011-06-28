var core = require("../dep/Nu-Q/src/NuQCore.js"),
	_ = require('util'),
	wrapper = require('./wrapper.js'),
	Session = require('./Session.js'),
	Node = require('./Node.js'),
	Item = require('./Item.js');
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
	function getNodesCollection(callback) {
		if (self.nodesCollection !== undefined) {
			callback(null, self.nodesCollection);
		} else {
			self.client.collection('repository.nodes', function(err, nodesCollection) {
				if (err === null) {
					self.nodesCollection = nodesCollection;
					self.nodesCollection.count(function(err, count) {
						if (count === 0) {
							callback(err, nodesCollection);
						} else {
							callback(err, nodesCollection);
						}
					});
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
    			_.debug('fail removing database');
    			callback(err,done);
    		} else {
    			console.log(done);
    			_.debug('database removed successfully');
    			self.client.close();
    			callback(null,"Database drop command successful, repository deleted");
    		}
    	});
    };
    /**
     * Implementation specific method
     */
    this.getRootNode = function(callback) {
    	var self = this;
    	
    	function createRootNode() {
    		getNodesCollection(function(err, collection){
	    		collection.insert({
	    			// path: abspath -- This is my repository root node
	    		}, {safe: true}, function(err, result) {
	    			if (err !== null) {
	    				callback(err);
	    			} else {
	    				self.rootNode = result;
	    				callback(err, result[0]);
	    			}
	    		});
    		});
    	}
    	if (typeof self.rootNode !== 'undefined') {
    		callback(err, self.rootNode);
    	} else {
    		createRootNode();
    	}
    };
    // process the repository Initialization
    if (typeof config === "undefined" || config === null) {
        throw new Error("Missing options parameter");
    }
    
    this.getDataById = function(id,callback) {
    	getNodesCollection(function(err, nodesCollection){
    		nodesCollection.find({"_id":id}).limit(1).toArray(function(err, node){
    			callback(err, node[0]);
    		});

    	});
    };
    
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