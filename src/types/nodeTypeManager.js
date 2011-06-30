//persist this (3.7.14)
var typesMap = {
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
	getNodeType: function getNodeType(nodeName) {
		return typesMap[typename]['typedef'];
	},
	getMixinNodeTypes: function getMixinNodeTypes(callback) {
		
	},
	getAllNodeTypes: function getAllNodeTypes(callback) {
		
	},
	getPrimaryNodeTypes: function(callback) {
		
	},
	hasNodeType: function hasNodeType(nodeName, callback) {
		
	},
	/**
	 * Registers a new node type.
	 * Check against 3.7.14.1 nt:nodeType (p56) validation of type
	 * @param type
	 * @param allowupdate
	 * @param callback
	 */
	registerNodeType: function registerNodeType(type, allowupdate) {
		if (type['jcr:nodeTypeName'] in typesMap) {
			if (typesMap[type['jcr:nodeTypeName']]['allowupdate']) {
				typesMap[type['jcr:nodeTypeName']]['typedef'] = type;
				typesMap[type['jcr:nodeTypeName']]['allowupdate'] = allowupdate;
			} else {
				throw new Error('Update is not allowed');
			}
		} else {
			typesMap[type['jcr:nodeTypeName']] = {
					'allowupdate': allowupdate,
					'typedef': type
			}
		}
	},
	registerNodeTypes: function registerNodeTypes(types, allowupdate, callback) {
		
	},
	unregisterNodeType: function unregisterNodeType(name, callback) {
		
	},
	unregisterNodeTypes: function unregisterNodeTypes(names, callback) {
		
	}
};

module.exports = nodeTypeManager;