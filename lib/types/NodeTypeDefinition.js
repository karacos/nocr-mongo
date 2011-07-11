
var NodeTypeDefinition, ntdproto,
	nocr = require("NoCR"),
	nodeTypeManager = require('./nodeTypeManager.js'),
	assert = require('assert'),
	_ = require('util');

ntdproto = {
		isAbstract: function() {
			var self = this;
			return self.data['jcr:isAbstract'];
		}
};

function NodeTypeDefinition(data) {
	var self = this;
	this['data'] = data;
	
	for (k in ntdproto) {
		self[k] = ntdproto[k];
	}
}

_.inherits(NodeTypeDefinition,nocr.nodetype.NodeTypeDefinition);

module.exports = NodeTypeDefinition;