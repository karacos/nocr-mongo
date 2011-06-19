var core = require("../dep/NEQ-CR/src/NEQCore.js"), Repository,
__hasProp = Object.prototype.hasOwnProperty,
__extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };

Repository = __extends(Repository,core.Repository);
function Repository(config) {
    if (typeof config === "undefined" || config === null) {
        throw new Error("Missing options parameter");
    }
}
    
module.exports = Repository;