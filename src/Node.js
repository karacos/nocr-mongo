var core = require("../dep/Nu-Q/src/NuQCore.js"),
	_ = require('util'),
	wrapper = require('./wrapper.js'),
	Item = require('./Item.js'),
	Node;

function Node(data) {
	Item.call(this, data);
	
	
}
_.inherits(Node,core.Node);
module.exports = Node;