var core = require("../dep/Nu-Q/src/NuQCore.js"),
	_ = require('util'),
	wrapper = require('./wrapper.js'),
	Item = require('./Item.js'),
	Node;

/**

 * @param data
 */

function Node(type, data) {
	Item.call(this, data);
	this.primaryType = type;
}
_.inherits(Node,core.Node);
module.exports = Node;