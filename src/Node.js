var nocr = require("NoCR"),
	_ = require('util'),
	assert = require('assert'),
	wrapper = require('./wrapper.js'),
	Item = require('./Item.js'),
	itemslookup = require('./utils/itemslookup.js'),
	Node, nodeproto,
	Property = require('./Property.js'),
	Value = require('./Value.js');

/**

 * @param data
 */
nodeproto = {
	getIdentifier: function() {
		return this.data._id.toString();
	},
	getProperty: function(name, callback) {
		var self = this, errmsg;
		if (name in self['properties']) {
			_.debug('[getProperty]: found in instances');
			if (typeof callback !== "undefined") {
				callback(null, self['properties'][name]);
			} else {
				return self['properties'][name];
			}
		} else if (name in self['node:properties']) {
			_.debug('[getProperty]: found in data');
			self.session.getRepository().getDataById(self['node:properties'][name],function(err, propData) {
				self['properties'][name] = new Property(propData, self.session);
				if (typeof callback !== "undefined") {
					callback(null, self['properties'][name]);
				} else {
					return self['properties'][name];
				}
			});
		} else {
			_.debug('[getProperty]: not found');
			errmsg = "Property not found in node";
			if (typeof callback !== "undefined") {
				callback(errmsg);
			} else {
				throw new Error(errmsg);
			}
		}
	},
	setProperty: function(name, value, type, callback) {
		//_.debug("[setProperty]: " + _.inspect(arguments));
		var self = this, type,error;
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
				if (name in self['node:properties'] || name in self['properties']) { //such property already exist ethier persisted or in session scope
					self.getProperty(name, function(err, prop) {//gets the property instance and sets the value
						if (err === null) {
							if (callback !== undefined ) {
								callback(err);
							}
						} else {
							prop.setValue(value); 
							if (callback !== undefined ) {
								callback(null, prop);
							}
						}
					});
				} else { // probe property type and create new property
					self['properties'][name] = new Property(value, self.session);
					if (callback !== undefined ) {
						callback(null, self['properties'][name]);
					}
				}
			} else { // property can't be set
				error = "Integrity error, can't set such propertie at such value";
				if (callback !== undefined ) {
					callback(error);
				} else {
					throw new Error();
				}
			}
		} else { //deleting the property if null or no value specified
			_.debug("value is not specified or null, removing  " + name + " property from registries");
			//_.debug(_.inspect(self['node:properties']));
			if (name in self['node:properties']) {
				_.debug("Property found in data, deleting");
				self['node:properties'][name] = undefined;
				delete self['node:properties'][name];
				self.ismodified = true;
			}
			if (name in self['properties']) {
				_.debug("Property found in instances, deleting");
				self['properties'][name] = undefined;
				delete self['properties'][name];
				self.ismodified = true;
			}  // deleting a nonexitent property have no effect
			if (callback !== undefined ) {
				callback(null,undefined);
			}
		}
	}, // Node.setPropertypropertytest
	addNode: function(path, typename) {
		var self = this;
		if (self.type.canAddChildNode(path,typename)) {
			
		} else {
			throw new Error("Operation addNode can't be performed");
		}
	}
};
function Node(data, session) {
	var self = this,
		workspace = session.getWorkspace();
	Item.call(self, data, session);
	//_.debug("Initializing Node :" + _.inspect(data));
	self['properties'] = {}; // data structure for properties instance (lazy load)
	self['childrens'] = {}; //data structure for nodes instances (lazy load)
	if (!'node:properties' in data) {
		data['node:properties'] = {}; //data reference map
	}
	if (!'node:childrens' in data) {
		data['node:childrens'] = {};
	}
	
	self['node:properties'] = data['node:properties'];
	self['node:childrens'] = data['node:childrens'];
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