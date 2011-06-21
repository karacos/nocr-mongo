var core = require("../dep/Nu-Q/src/NuQCore.js"),
	_ = require('util'),
	wrapper = require('./wrapper.js'),
	Item = require('./Item.js'),
	Node;

function Node() {
	
}
_.inherits(Node,core.Node);
_.inherits(Node,Item);
module.exports = Node;