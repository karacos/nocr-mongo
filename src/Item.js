var core = require("../dep/Nu-Q/src/NuQCore.js"),
	_ = require('util'),
	wrapper = require('./wrapper.js'),
	Item;

function Item(properties) {
	this.path = properties.path;
	this.getPath = function() {
		return this.path;
	};
}
_.inherits(Item,core.Item);
module.exports = Item;