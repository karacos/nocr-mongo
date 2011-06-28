//persist this (3.7.14)
var typesMap = {
		'nt:base': require('./Base.js'),
		'nt:unstructured': require('./Unstructured.js')
};
nodeTypeManager = {
	createNodeDefinitionTemplate: function createNodeDefinitionTemplate(callback){
		
	},
	createNodeTypeTemplate: function createNodeTypeTemplate(definition, callback) {
		if (callback === undefined) { // assume single parameter is a callback
			callback = definition;
		}
		if (typeof callback.call !== "function") { // single parameter call assume definition
			callback = undefined;
		}
	},
	getNodeType: function getNodeType(nodeName, callback) {
		callback(null,typesMap[typename]);
	},
	getMixinNodeTypes: function getMixinNodeTypes(callback) {
		
	},
	getAllNodeTypes: function getAllNodeTypes(callback) {
		
	},
	getPrimaryNodeTypes: function(callback) {
		
	},
	hasNodeType: function hasNodeType(nodeName, callback) {
		
	},
	registerNodeType: function registerNodeType(type, allowupdate, callback) {
		
	},
	registerNodeTypes: function registerNodeTypes(types, allowupdate, callback) {
		
	},
	unregisterNodeType: function unregisterNodeType(name, callback) {
		
	},
	unregisterNodeTypes: function unregisterNodeTypes(names, callback) {
		
	}
};

module.exports = nodeTypeManager;