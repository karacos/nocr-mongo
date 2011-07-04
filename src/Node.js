var core = require("NoCR"),
	_ = require('util'),
	wrapper = require('./wrapper.js'),
	Item = require('./Item.js'),
	Node, nodeproto;

/**

 * @param data
 */
nodeproto = {
	getIdentifier: function() {
		return this.data._id.toString();
	}
};
function Node(type, data) {
	Item.call(this, data);
	_.debug("Initializing Node :" + _.inspect(data));
	this.primaryNodeType = data.primaryNodeType;
	for (k in nodeproto) {
		this[k] = nodeproto[k];
	}
}
_.inherits(Node,core.Node);
module.exports = Node;