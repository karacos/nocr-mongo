var nocr = require("NoCR"),
	_ = require('util'),
	assert = require('assert'),
	log4js = require('log4js')(),
	wrapper = require('./wrapper.js'),
	Item = require('./Item.js'),
	itemslookup = require('./utils/itemslookup.js'),
	Node, nodeproto,
	Property = require('./Property.js'),
	nodeTypeManager = require('./types/nodeTypeManager.js'),
	Value = require('./Value.js');

/**
 * @param data
 */
nodeproto = {
	getIdentifier: function(callback) {
		self = this;
//		self.getSession().getNode(self.path,function(err, node){
//			self.logger.debug(_.inspect(node));
//		});
		self.logger.trace(_.inspect(self.data));
		self.logger.debug("getidentifier returns" + _.inspect(self.data['_id'].toString()));
		return self.data['_id'].toString();
	},
	/**
	 * Can accept callback func or not, as operations are performed in-memory, there is no async
	 */
	getProperty: function(name, callback) {
		var self = this, errmsg;
		self.session.getItem(self.getPath() + name, function(err,item) {
			if (item instanceof nocr.Property) {
				callback(null, item);
			} else {
				if (name in self['properties']) {
					self.logger.debug('[getProperty]: found in instances'); // memory cache L1
					if (typeof callback !== "undefined") {
						self.logger.trace(_.inspect(self['properties'][name]));
						callback(null, self['properties'][name]);
					} else {
						return self['properties'][name];
					}
				} else if (name in self['node:properties']) {
					self.logger.debug('[getProperty]: found in data');
					self.session.getRepository().getDataById(self['node:properties'][name],function(err, propData) {
						self['properties'][name] = new Property(propData, self.session);
						if (typeof callback !== "undefined") {
							self.logger.trace(_.inspect(self['properties'][name]));
							callback(null, self['properties'][name]);
						} else {
							return self['properties'][name];
						}
					});
				} else {
					self.logger.debug('[getProperty]: not found');
					errmsg = "Property not found in node";
					if (typeof callback !== "undefined") {
						callback(errmsg);
					} else {
						throw new Error(errmsg);
					}
				}
			}
		});
	},
	/**
	 * Can accept callback func or not, as operations are performed in-memory, there is no async
	 */
	setProperty: function(name, value, type, callback) {
		var self = this, type,error, prop;
		self.logger.trace("[setProperty]: " + _.inspect(arguments));
		if (arguments.length === 0) {
			throw new Error("at least name should be specified");
		}
		if (arguments.length === 2) {
			if (typeof arguments[1] === 'function') {
				callback = value;
				value = undefined;
			}
		}
		if (arguments.length === 3) {
			if (typeof arguments[2] === 'function') {
				callback = type;
				type = undefined;
			}
		}
		if (callback === undefined ) {
			callback = function(){};
		}
		//
		// TODO: ACL check for writing
		//
		name = name.toString();
		if (value !== null && value !== undefined) {
			if (!(value instanceof nocr.Value)) { //this is not a value object
				value = new Value(value); 
			}
			if (self.type.canSetProperty(name, value)) {
				self.ismodified = true;
				self.logger.trace(_.inspect(self));
				if (name in self['node:properties'] || name in self['properties']) { //such property already exist ethier persisted or in session scope
					self.getProperty(name, function(err, prop) {//gets the property instance and sets the value
						if (err === null) {
							callback(err);
						} else {
							prop.setValue(value); 
								callback(null, prop);
						}
					});
				} else { // probe property type and create new property
					prop = new Property(value, self.session);
					prop['data']['path'] = self.getPath() + name; //Node names always ends with /
					//_.debug("Session scope property object " + _.inspect(prop));
					
					// node local cache name reference
					self['properties'][name] = prop;
					
					// Session cache reference and path index
					self.session.items.setItem(prop['data']['path'], prop, callback);
				}
			} else { // property can't be set
				error = "Integrity error, can't set such propertie at such value";
				if (callback !== function(){} ) {
					callback(error);
				} else {
					throw new Error();
				}
			}
		} else { //deleting the property if null or no value specified
			self.logger.info("value is not specified or null, removing  " + name + " property from registries");
			//_.debug(_.inspect(self['node:properties']));
			if (name in self['node:properties']) {
				self.logger.debug("Property found in data, deleting");
				self['node:properties'][name] = undefined;
				delete self['node:properties'][name];
				self.ismodified = true;
			}
			if (name in self['properties']) {
				self.logger.debug("Property found in instances, deleting");
				self['properties'][name] = undefined;
				delete self['properties'][name];
				self.ismodified = true;
				self.session.getWorkspace().indexdata.push({
					'item:path':self.getPath() + name,
					'item:type': 'Property',
					'item:id': undefined});
			}  // deleting a nonexitent property have no effect
				callback(null,undefined);
		}
	}, // Node.setPropertypropertytest
	/**
	 * 
	 */
	addNode: function(path, typename, callback) {
		var self = this,
			data,
			node,
			parent,
			pathcheck = path.split('/'), pchecklen, pchkid,
			pabspath; // supposed parent relative path (if not self)
		/**
		 * Throws an error if either no child type is applicable or
		 * more than on type match.
		 */
		function guessChildType(parent, path) {
			var childNodesDef = parent.type.getChildNodeDefinitions(),
				childTypeNames = [];
			childNodesDef.forEach(function(propdef) {
				var 
					restr = "^" + propdef['jcr:name'] + "$",
				re = new RegExp(restr);
				if (re.test(childName)) {
					propdef['jcr:requiredPrimaryTypes'].forEach(function(typename, i) {
						if (!nodeTypeManager.getNodeType(typename).isAbstract()) {
							childTypeName.push(typename);
						}
					});
				}
			});
			if (childTypeNames.length === 1) {
				return childTypeNames[0];
			} else {
				throw new Error("Definiton problem, childNode type cannot be determined");
			}
		} //   ---------------------- /function --------------------
		
		function processAddNode(childName, parent) {
			if (parent.type.canAddChildNode(path,typename)) {
				if (typename === undefined) {
					typename = guessChildType(path);
				}
				node = new Node({
						'path': parent.getPath() + childName + '/', // Implementation data, Index
						'node:type': 'nt:unstructured' // implementation reference
					}, self.session);
				self.logger.trace(_.inspect(node));
				parent.ismodified = true;
				// parent node by name index
				parent['childrens'][childName] = node;
				// Session cache reference and path index
				parent.session.items.setItem(node['data']['path'], node, callback);
				node.setProperty('nt:primaryType', // Setting this default property which will be required all times
						new Value({
							'property:value':typename,
							'property:type': 'NAME'
						})
					);
				self.logger.trace(_.inspect(node));
			} else {
				throw new Error("Integrity problem, Operation addNode can't be performed");
			}
		} //   ---------------------- /function --------------------
		
		pchecklen = pathcheck.length; 
		if (pchecklen === 0){
			throw new Error("Invalid path");
		} else if (pchecklen === 1) {
			processAddNode(pathcheck[0], self);
		} else {
			
			pabspath = "";
			for (pcheckid = 0; pcheckid < pchecklen -1; pcheckid++) {
				pabspath = pabspath  + pathcheck[pcheckid] + '/';
			}
			self.getNode(pabspath, function(err, node) {
				if (err !== null) {
					callback(err);
				} else {
					processAddNode(pathcheck[pchecklen -1], node);
				}
			});
		}
	},
	getNode: function(path, callback) {
		var pabspath,
			self = this;
		pabspath = self.getPath() + path;
		if (pabspath[pabspath.length-1] !== "/") {
			pabspath = pabspath + "/";
		}
		self.session.getNode(pabspath, function(err, node) {
			self.logger.trace("Item at " + pabspath + ' : ' + _.inspect(node));
			if (err !== null) {
				self.logger.error(err);
				callback(err);
			}else {
				if (node instanceof nocr.Node) {
					callback(err, node);
				} else {
					callback("Invalid parent found");
				}
			}
		});
	},
	getSession: function() {
		return this.session;
	}
};
function Node(data, session) {
	var self = this,
		workspace = session.getWorkspace();
	self['properties'] = {}; // data structure for properties instance (lazy load)
	self['childrens'] = {}; //data structure for nodes instances (lazy load)
	if (!'node:properties' in data || data['node:properties'] === undefined) {
		data['node:properties'] = {}; //data reference map
	}
	if (!'node:childrens' in data || data['node:childrens'] === undefined) {
		data['node:childrens'] = {};
	}
	self['node:properties'] = data['node:properties'];
	self['node:childrens'] = data['node:childrens'];
	Item.call(self, data, session);
	self.logger.info("Initializing Node");
	self.logger.trace(_.inspect(data));
	if (data['node:properties:' + workspace.getName()] !== undefined) {
		for (k in data['node:properties:' + workspace.getName()]) {
			self['node:properties'][k] = data['node:properties:' + workspace.getName()][k];
		}
	}
	if (data['node:childrens:' + workspace.getName()] !== undefined) {
		for (k in data['node:childrens:' + workspace.getName()]) {
			self['node:childrens'][k] = data['node:childrens:' + workspace.getName()][k];
		}
	}
	
	for (k in nodeproto) {
		self[k] = nodeproto[k];
	}
	self.type = nodeTypeManager.getNodeType(data['node:type']);
}
_.inherits(Node,nocr.Node);
module.exports = Node;