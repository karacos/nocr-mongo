var core = require("../dep/Nu-Q/src/NuQCore.js"),
	_ = require('util'),
	wrapper = require('./wrapper.js'),
	Session = require('./Session.js'),
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
    this.drop = function(callback) {
    	self.client.dropDatabase(function(err, done) {
    		if (err !== null) {
    			callback(err,done);
    		} else {
    			callback(null,"Database drop command successful, repository deleted");
    		}
    	});
    };
}
_.inherits(Repository,core.Repository);

module.exports = Repository;