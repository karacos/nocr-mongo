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
}
_.inherits(Repository,core.Repository);

module.exports = Repository;