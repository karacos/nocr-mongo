var NodeType = require('NodeType.js');
/**
Apply nt:base requirements (3.7.10.1 p 51)
[nt:base] abstract
	- jcr:primaryType (NAME) mandatory autocreated protected COMPUTE
	- jcr:mixinTypes (NAME) protected multiple COMPUTE
*/
Base = new NodeType({
		'jcr:nodeTypeName': 'nt:base',
		'jcr:isAbstract': true,
		'jcr:isQueryable': false,
		'jcr:isMixin': false,
		'jcr:hasOrderableChildNodes': false,
		'jcr:propertyDefinition':
			[{ 
				'jcr:name': 'jcr:primaryType',
				'jcr:autoCreated': true,
				'jcr:mandatory': true,
				'jcr:onParentVersion': "IGNORE",
				'jcr:protected': true,
				'jcr:requiredType': "NAME",
				'jcr:multiple': false,
				'jcr:availableQueryOperators': [],
				'jcr:isFullTextSearchable': false,
				'jcr:isQueryOrderable': false
			},
			{
				'jcr:name':'jcr:mixinTypes',
				'jcr:autoCreated': false,
				'jcr:mandatory': false,
				'jcr:onParentVersion': "IGNORE",
				'jcr:protected': true,
				'jcr:requiredType': "NAME",
				'jcr:multiple': true,
				'jcr:availableQueryOperators': [],
				'jcr:isFullTextSearchable': false,
				'jcr:isQueryOrderable': false
			}
		]
});


module.exports = Base;