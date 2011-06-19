var core = require("../dep/Nu-Q/src/NuQCore.js"),
	_ = require('util'),
	wrapper = require('./wrapper.js'),
	Session = function(credentials) {
		this.getRepository = function(callback) {
	};
};
_.inherits(Session,core.Session);

module.exports = Session;