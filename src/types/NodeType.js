
var NodeType,
	nodeTypeManager = require('./nodeTypeManager.js'),
	assert = require('assert'),
	_ = require('util');

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
		assert.ok('jcr:nodeTypeName' in data, "jcr:nodeTypeName is not found");
		assert.ok('jcr:isAbstract' in data, "jcr:isAbstract is not found");
		assert.ok('jcr:isQueryable' in data, "jcr:isQueryable is not found");
		assert.ok('jcr:isMixin' in data, "jcr:isMixin is not found");
		assert.ok('jcr:hasOrderableChildNodes' in data, "jcr:hasOrderableChildNodes is not found");
		if ('jcr:childNodeDefinition' in data) {
			for (childNode in data['jcr:childNodeDefinition']) {
				if (childNode.constructor === Array) {
					assert.ok('jcr:autoCreated' in childNode,"jcr:autoCreated is not found");
					assert.ok('jcr:mandatory' in childNode,"jcr:mandatory is not found");
					assert.ok('jcr:onParentVersion' in childNode,"jcr:onParentVersion is not found");
					assert.ok('jcr:protected' in childNode,"jcr:protected is not found");
					assert.ok('jcr:requiredPrimaryTypes' in childNode,"jcr:requiredPrimaryTypes is not found");
					assert.ok('jcr:sameNameSiblings' in childNode,"jcr:sameNameSiblings is not found");
				}
			}
		}
		if ('jcr:propertyDefinition' in data) {
			for (property in data['jcr:propertyDefinition']) {
				if (property.constructor === Array) {
					assert.ok('jcr:autoCreated' in property,"jcr:autoCreated is not found");
					assert.ok('jcr:mandatory' in property,"jcr:mandatory is not found");
					assert.ok('jcr:onParentVersion' in property,"jcr:onParentVersion is not found");
					assert.ok('jcr:protected' in property,"jcr:protected is not found");
					assert.ok('jcr:requiredType' in property,"jcr:requiredType is not found");
					assert.ok('jcr:multiple' in property,"jcr:multiple is not found");
					assert.ok('jcr:availableQueryOperators' in property,"jcr:availableQueryOperators is not found");
					assert.ok('jcr:isFullTextSearchable' in property," is not found");
//				assert.ok('' in childNode," is not found");
				}
			}
		}
	},
	extend: function(data) {
		//console.log(data);
		this.assertMandatory(data);
		var key, property, type, typedata = {}, item;
		for (key in this.data) {
			typedata[key] = data[key];
		}
		for (key in typedata) {
			if (typeof data[key] !== "object") {
				typedata[key] = data[key];
			} else {
				if (data[key].constructor === Array) {
					for (item in data[key]) {
						if (item !== undefined) {
							typedata[key].push(data[key][item]);
						}
					}
				}
			}
		}
		//_.log(_.inspect(typedata));
		type = new NodeType(typedata);
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

// loading

require('./Application.js');
require('./Hierarchy.js');
require('./Mixins.js');
require('./Unstructured.js');
require('./TypeStorage.js');