var NodeType = require('NodeType.js');
/**
Apply nt:base requirements
[nt:base] abstract
	- jcr:primaryType (NAME) mandatory autocreated protected COMPUTE
	- jcr:mixinTypes (NAME) protected multiple COMPUTE
*/
Base = new NodeType({
		isabstract: true,
		properties: [{
			name: 'jcr:primaryType',
			type: String,
			mandatory: true
		},{
			name: 'jcr:mixinTypes',
			type: String,
			'protected': true,
			multiple: true
		}]
});

module.exports = Base;