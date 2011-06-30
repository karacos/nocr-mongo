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
	_.debug("Initializing Node :" + _.inspect(data));
	this.primaryNodeType = data.primaryNodeType;
}
_.inherits(Node,core.Node);
module.exports = Node;