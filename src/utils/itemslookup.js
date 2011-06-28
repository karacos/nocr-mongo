var
	nodeTypeManager = require("../types/nodeTypeManager.js"),
	Property = require('../Property.js'),
	Node = require('../Node.js');

function lookupType(itemData, callback) {
	if (!('jcr:primaryType' in itemData)) { // This is a Node Item
		nodeTypeManager.getNodeType(itemData['jcr:primaryType'], function (err, type){
			var node;
			if (err == null) {
				callback(err, node);
			} else {
				type.ckeckData(itemData);
				node = new Node(type,itemData);
				callback(err, node);
			}
		});
	} else if ('about' in itemData) { // This is a property Item
		return new Property(itemData);
	} else { // This is an error !!
		return itemData;
	}
}