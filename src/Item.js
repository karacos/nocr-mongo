var nocr = require("NoCR"),
	_ = require('util'),
	wrapper = require('./wrapper.js'),
	Item;

function Item(data, workspace) {
	var k;
	this.getPath = function() {
		return this.data.path;
	};
	this.data = data;
	this['properties'] = data['properties'];
	if (workspace instanceof nocr.Workspace) {
		if (data['properties:' + workspace.getName()] !== undefined) {
			for (k in data['properties:' + workspace.getName()]) {
				this['properties'][k] = data['properties:' + workspace.getName()][k];
			}
		}
	}
}
_.inherits(Item,nocr.Item);
module.exports = Item;