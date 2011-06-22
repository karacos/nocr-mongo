var core = require("../dep/Nu-Q/src/NuQCore.js"),
	_ = require('util'),
	wrapper = require('./wrapper.js'),
	Item;

function Item(data) {
	this.data = data;
	this.getPath = function() {
		return this.data.path;
	};
}
_.inherits(Item,core.Item);
module.exports = Item;