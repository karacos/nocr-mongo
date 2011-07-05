var nocr = require("NoCR"),
	_ = require('util'),
	wrapper = require('./wrapper.js'),
	Value, valueproto;

valueproto = {
		getValue: function() {
			return this.value;
		},
		getType: function() {
			return this.type;
		},
		getString: function() {
			return this.value.toString();
		}
};
function Value(data) {
	var self = this, k;
	function guessType(objvalue) {
		if (typeof objvalue === "undefined") {
			return 'UNDEFINED';
		}
		if (typeof objvalue === "boolean") {
			return 'BOOLEAN';
		}
		if (typeof objvalue === "string") {
			return 'STRING';
		}
		if (typeof objvalue === "number") {
			return 'NUMBER';
		}
		if (typeof objvalue === "object") {
			if (objvalue.constructor = Date) {
				return 'DATE';
			}
			// TODO : handle more types, at least BINARY
			throw new Error("Type error, incorrect value type");
		}
	}
	function createValue(type) {
		if (type === 'UNDEFINED') {
			return;
		}else if (type === 'BOOLEAN') {
			return true;
		} else if (type === 'STRING') {
			return "";
		} else if (type === 'NUMBER') {
			return 0;
		} else if (type === 'DATE') {
			return new Date();
		}
	}
	
	function checkIntegrity(data) {
		var guess = guessType(data['property:value']),
			compatibility = require('./utils/itemslookup.js').valueCompatibility;
		_.debug("Checking types integrity : " + data['property:type'] + " vs " + guess);
		if (compatibility[guess].indexOf(data['property:type']) === -1 ) {
			throw new Error("Incompatible type/value found");
		}
		
	}
	
	if (typeof data === "undefined") {
		throw new Error("Value cannot specify a value without parameter object");
	}
	if (typeof data !== "object" || data.constructor === Date ) {
		data = {'property:value': data};
	}
	
	if (!('property:type' in data)) {
		if ('property:value' in data) {
			data['property:type'] = guessType(data['property:value']);
		} else {
			throw new Error("Value cannot specify a value without type nor value");
		}
	} else {
		if (!('property:value' in data)) {
			data['property:value'] = createValue(data['property:type']);
		}
	}
	checkIntegrity(data);
	this.type = data['property:type'];
	this.value = data['property:value'];
	for ( k in valueproto) {
		self[k] = valueproto[k];
	}
	this.serialize = this.getString; //TODO : much better to do here, quick workaround
}

_.inherits(Value,nocr.Value);
module.exports = Value;