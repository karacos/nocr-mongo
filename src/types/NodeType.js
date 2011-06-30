
var NodeType, nodeTypeManager = require('./nodeTypeManager.js');

NodeType = function(data) {
	this.constructor(data);
};
NodeType.prototype = {
	constructor: function(data) {
		this.assertMandatory(data);
		if (!('jcr:childNodeDefinition' in data)) {
			data['jcr:childNodeDefinition'] = [];
		}
		if (!('jcr:propertyDefinition' in data)) {
			data['jcr:propertyDefinition'] = [];
		}
		if (!('jcr:supertypes' in data)) {
			data['jcr:supertypes'] = [];
		}
		this.data = data;
		nodeTypeManager.registerNodeType(this);
	},
	assertMandatory: function(data) {
		var childNode, property;
		assert('jcr:nodeTypeName' in data, "jcr:nodeTypeName is not found");
		assert('jcr:isAbstract' in data, "jcr:isAbstract is not found");
		assert('jcr:isQueryable' in data, "jcr:isQueryable is not found");
		assert('jcr:isMixin' in data, "jcr:isMixin is not found");
		assert('jcr:hasOrderableChildNodes' in data, "jcr:hasOrderableChildNodes is not found");
		if ('jcr:childNodeDefinition' in data) {
			for (childNode in data['jcr:childNodeDefinition']) {
				assert('jcr:autoCreated' in childNode,"jcr:autoCreated is not found");
				assert('jcr:mandatory' in childNode,"jcr:mandatory is not found");
				assert('jcr:onParentVersion' in childNode,"jcr:onParentVersion is not found");
				assert('jcr:protected' in childNode,"jcr:protected is not found");
				assert('jcr:requiredPrimaryTypes' in childNode,"jcr:requiredPrimaryTypes is not found");
				assert('jcr:sameNameSiblings' in childNode,"jcr:sameNameSiblings is not found");
			}
		}
		if ('jcr:propertyDefinition' in data) {
			for (property in data['jcr:propertyDefinition']) {
				assert('jcr:autoCreated' in property,"jcr:autoCreated is not found");
				assert('jcr:mandatory' in property,"jcr:mandatory is not found");
				assert('jcr:onParentVersion' in property,"jcr:onParentVersion is not found");
				assert('jcr:protected' in property,"jcr:protected is not found");
				assert('jcr:requiredType' in property,"jcr:requiredType is not found");
				assert('jcr:multiple' in property,"jcr:multiple is not found");
				assert('jcr:availableQueryOperators' in property,"jcr:availableQueryOperators is not found");
				assert('jcr:isFullTextSearchable' in property," is not found");
				assert('' in childNode," is not found");
			}
		}
	},
	extend: function(data) {
		this.assertMandatory(data);
		var key, property, type, item;
		type = new nodeType(this.data);
		for (key in data) {
			if (typeof data[key] !== "object") {
				type.data[key] = data[key];
			} else {
				if (data[key].constructor === Array) {
					for (item in data[key]) {
						type.data[key].push(item);
					}
				}
			}
			if ('jcr:supertypes' in type.data) {
				type.data['jcr:supertypes'].push(this.data['jcr:nodeTypeName']);
			} else {
				type.data['jcr:supertypes'] = [this.data['jcr:nodeTypeName']];
			}
		}
		nodeTypeManager.registerNodeType(type);
		return type;
	},
	canAddChildNode: function(childName, childTypeName) {
		if (this.data['jcr:childNodeDefinition'].length > 0) {
			
		}
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