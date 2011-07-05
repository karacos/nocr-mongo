
var NodeType, ntproto,
	nocr = require("NoCR"),
	nodeTypeManager = require('./nodeTypeManager.js'),
	NodeTypeDefinition = require('./NodeTypeDefinition.js'),
	assert = require('assert'),
	_ = require('util');

ntproto = {
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
//					assert.ok('' in childNode," is not found");
					}
				}
			}
		},
		extend: function(data) {
			//console.log(data);
			this.assertMandatory(data);
			var key, property, type, typedata = {}, item;
			for (key in this.data) {
				if (data[key] !== undefined) {
					typedata[key] = data[key];
				}
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
			type['data']['jcr:supertypes'].push(this['data']['jcr:nodeTypeName']);
			type._super_ = this;
			return type;
		},
		canAddChildNode: function(childName, childTypeName) {
			var self = this,
				result = false,
				childType;
			if (this.data['jcr:childNodeDefinition'].length > 0) {
				self['data']['jcr:childNodeDefinition'].forEach(function(propdef,i) {
					var restr = "^" + propdef['jcr:name'] + "$",
						re = new RegExp(restr);
					if (re.test(childName)) {
						if (childTypeName === undefined) {
							propdef['jcr:requiredPrimaryTypes'].forEach(function(typename, i) {
								if (!nodeTypeManager.getNodeType(typename).isAbstract()) {
									result = true;
								}
							});
						} else {
							childType = nodeTypeManager.getNodeType(childTypeName); 
							if (!childType.isAbstract()) {
								//_.debug("Searching for " + childTypeName + " in " + propdef['jcr:requiredPrimaryTypes']);
								if (propdef['jcr:requiredPrimaryTypes'].indexOf(childTypeName) >= 0) {
									result = true;
								} else {
									//_.debug("supertypes of child node : " + _.inspect(childType.getSupertypes()));
									childType.getSupertypes().forEach(function(supertypename) {
										//_.debug("Searching for " + supertypename + " in " + propdef['jcr:requiredPrimaryTypes']);
										if (propdef['jcr:requiredPrimaryTypes'].indexOf(supertypename) >= 0) {
											result = true;
										}
									});
								}
							}
						}
					}
				});
			}
			return result;
		},
		canRemoveNode: function(nodeName) {
		},
		canRemoveProperty: function(propertyName) {
			
		},
		canSetProperty: function(propertyName, propertyValue) {
			var result = false,
				self = this,
				compatibility = require('../utils/itemslookup.js').valueCompatibility;
			self['data']['jcr:propertyDefinition'].forEach(function(propdef,i) {
				var restr = "^" + propdef['jcr:name'] + "$",
					re = new RegExp(restr);
				
				//_.debug("'jcr:requiredType' = " + propdef['jcr:requiredType']);
				//_.debug(_.inspect(propdef));
				if (compatibility[propdef['jcr:requiredType']].indexOf(propertyValue.getType()) > 0 &&
						re.test(propertyName)) {
					result = true;
				}
			});
			return result;
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
			return this.data['jcr:supertypes'];
		},
		isNodeType: function(typeName) {
			var self = this;
			if (self.data['jcr:nodeTypeName'] == typeName) {
				return true;
			} else {
				return false;
			}
		}
	};


NodeType = function(data) {
	var self = this;
	NodeTypeDefinition.call(self, data);
	for (k in ntproto) {
		this[k] = ntproto[k];
	}
	this.constructor(data);
};
_.inherits(NodeType,nocr.nodetype.NodeType);

module.exports = NodeType;

// loading

require('./Application.js');
require('./Hierarchy.js');
require('./Mixins.js');
require('./Unstructured.js');
require('./TypeStorage.js');