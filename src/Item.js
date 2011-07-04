var nocr = require("NoCR"),
	_ = require('util'),
	wrapper = require('./wrapper.js'),
	Item;

function Item(data) {
	this.data = data;
	this.getPath = function() {
		return this.data.path;
	};
}
_.inherits(Item,nocr.Item);
module.exports = Item;