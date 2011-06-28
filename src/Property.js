var core = require("../dep/Nu-Q/src/NuQCore.js"),
	_ = require('util'),
	wrapper = require('./wrapper.js'),
	Item = require('./Item.js'),
	Property;

/**

 * @param data
 */

function Property(data) {
	Item.call(this, data);
	
}
_.inherits(Property,core.Property);
module.exports = Property;