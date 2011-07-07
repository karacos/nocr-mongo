var nocr = require("NoCR"),
	_ = require('util'),
	log4js = require('log4js')(),
	wrapper = require('./wrapper.js'),
	Item = require('./Item.js'),
	Value = require('./Value.js'),
	Property, proproto;

/**

 * @param data
 */
proproto = {
		setValue: function(value,callback) {
			var self = this;
			if (callback !== undefined) {
				callback(null,self);
			}
		},
		getValue: function() {
			return this['value'];
		},
		getType: function() {
			return this['value'].getType();
		},
		getString: function() {
			return this.getValue().getString();
		}
};
function Property(paramdata, session) {
	var self = this, k, data,value;
	if ('_id' in paramdata) { // this is a database record
		data = paramdata;
	} else { // this is an object {'name':"", 'value': value}
		if (paramdata instanceof nocr.Value) {
			data = {
					'item:type': 'Property',
					'property:type':paramdata.getType(),
					'property:value': paramdata.serialize()
			};
			this['value'] = paramdata;
		}
	}
	Item.call(this, data, session);
	if (typeof this['value'] === 'undefined') {
		this['value'] = new Value(this['data']);
	}
	
	for (k in proproto) {
		self[k] = proproto[k];
	}
}
_.inherits(Property,nocr.Property);
module.exports = Property;