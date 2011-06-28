
var NodeType;

NodeType = function(data) {
	this.constructor(data);
};
NodeType.prototype = {
	/**
	 * Perform check against data
	 * Implementation specific
	 * @param itemData
	 */
	ckeckData: function(itemData) {
		for (property in this.data.properties) {
			if (property.mandatory) {
				assert(property.name in itemData, "Error, " + property.name + "is not present");
			}
		}
	},
	constructor: function(data) {
		this.data = data;
	},
	canAddChildNode: function(childName, childTypeName) {
		
	},
	canRemoveNode: function(nodeName) {
	},
	canRemoveProperty: function(propertyName) {
		
	},
	canSetProperty: function(propertyName, propertyValue) {
		
	},
	getChildNodeDefinitions: function() {
		
	},
	getDeclaredSubtypes: function() {
		
	},
	getPropertyDefinitions: function() {
		
	},
	getSubtypes: function() {
		
	},
	getSupertypes: function() {
		
	},
	isNodeType: function(typeName) {
		
	}
};

module.exports = NodeType;