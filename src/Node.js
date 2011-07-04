var nocr = require("NoCR"),
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
function Node(data, workspace) {
	Item.call(this, data, workspace);
	_.debug("Initializing Node :" + _.inspect(data));
	
	for (k in nodeproto) {
		this[k] = nodeproto[k];
	}
	this.type = nodeTypeManager.getNodeType(this['properties']['nt:primaryNodeType']);
}
_.inherits(Node,nocr.Node);
module.exports = Node;