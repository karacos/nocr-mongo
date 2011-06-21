var core = require("../dep/Nu-Q/src/NuQCore.js"),
	_ = require('util'),
	wrapper = require('./wrapper.js'),
	Item = require('./Item.js'),
	Node;

function Node(properties) {
	Item.call(this, properties);
	this.path = properties.path;
	
	
	
}
_.inherits(Node,Item);
_.inherits(Node,core.Node);
module.exports = Node;