var nocr = require("NoCR"),
	_ = require('util'),
	log4js = require('log4js')(),
	wrapper = require('./wrapper.js'),
	assert = require('assert'),
	Item, itemproto;
itemproto = {
		isNew: function() {
			return this.isnew;
		},
		isModified: function() {
			return this.ismodified;
		}
	};
function Item(data, session) {
	var k, self = this;
	assert.ok((session instanceof nocr.Session), "Missing argument, session is not specified");
	this.getPath = function() {
		return this.data.path;
	};
	this.data = data;
	this.session = session;
	if ('_id' in data) {
		this.isnew = false;
		this.ismodified = false;
	} else {
		this.isnew = true;
		this.ismodified = true;
	}
	self.logger = log4js.getLogger("nocr-mongo.Workspace." + data._id);
	//_.debug(_.inspect(session));
	//_.debug(_.inspect(nocr.Session));
	for (k in itemproto) {
		this[k] = itemproto[k];
	}
}
_.inherits(Item,nocr.Item);
module.exports = Item;