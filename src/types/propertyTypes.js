var Item = require('../Item.js'),
	propertyTypes = require('./propertyTypes.js');
function ItemReference(item) {
	assert(ref instanceof Item,"item parameter doesn't refers a valid Item");
	this.value = item._id;
	this.valueOf = function() {
		return this.value.valueOf();
	};
	this.toString = function() {
		return this.value.toString();
	};
}

function ItemDate() {
	this.value = new Date();
	this.valueOf = function() {
		return this.value.valueOf();
	};
	this.toString = function() {
		return this.value.toString();
	};
}

function ItemBinary() {
}

function Undefined() {
	
}

function Name(name) {
	
}
exports.Undefined = Undefined;
exports.Binary = ItemBinary;
exports.Date = ItemDate;
exports.Reference = ItemReference;
exports.Name = Name;