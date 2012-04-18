//persist this (3.7.14)
var typesMap = {},
	_ = require('util'),
	log4js = require('log4js')(),
	logger = log4js.getLogger("nocr-mongo.nodeTypeManager"),
//nodeTypeManager = function(){
//	console.log("Creating node type manager");
//};

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
	getNodeType: function getNodeType(typeName) {
		logger.info("getting typedef for " + typeName);
		return typesMap[typeName]['typedef'];
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
		if (allowupdate === undefined) {
			allowupdate = false;
		}
		if (type.data['jcr:nodeTypeName'] in typesMap) {
			if (typesMap[type.data['jcr:nodeTypeName']]['allowupdate']) {
				typesMap[type.data['jcr:nodeTypeName']]['typedef'] = type;
				typesMap[type.data['jcr:nodeTypeName']]['allowupdate'] = allowupdate;
			} else {
				logger.error(_.inspect(type));
				throw new Error('Update is not allowed');
			}
		} else {
			typesMap[type.data['jcr:nodeTypeName']] = {
					'allowupdate': allowupdate,
					'typedef': type
			};
		}
		logger.info("Registered node type [" + type.data['jcr:nodeTypeName'] + "]" );
	},
	registerNodeTypes: function registerNodeTypes(types, allowupdate, callback) {
		
	},
	unregisterNodeType: function unregisterNodeType(name, callback) {
		
	},
	unregisterNodeTypes: function unregisterNodeTypes(names, callback) {
		
	}
};

module.exports = nodeTypeManager;
require('./NodeType.js');