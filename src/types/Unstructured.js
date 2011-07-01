var Base = require("./Base.js"),
	propertyTypes = require('./propertyTypes.js');
/* 
3.7.13 Unstructured Content
Support for unstructured content may be provided by supporting a free-form
node type: nt:unstructured. Support for this node type requires support for the
UNDEFINED property type value.
3.7.13.1 nt:unstructured
[nt:unstructured]
orderable
- * (UNDEFINED) multiple
- * (UNDEFINED)
+ * (nt:base) = nt:unstructured sns VERSION
This node type is used to store unstructured content. It allows any number of
child nodes or properties with any names. It also allows multiple nodes having
the same name as well as both multi-value and single-value properties with any
names. This node type also supports client-orderable child nodes.
 */


Base.extend({
	'jcr:nodeTypeName': 'nt:unstructured',
	'jcr:isAbstract': false,
	'jcr:isQueryable': true,
	'jcr:isMixin': false,
	'jcr:hasOrderableChildNodes': false,
	'jcr:primaryItemName': 'jcr:data',
	'jcr:propertyDefinition': 
		[{ 
			'jcr:name': '*',
			'jcr:autoCreated': false,
			'jcr:mandatory': false,
			'jcr:onParentVersion': "IGNORE",
			'jcr:protected': false,
			'jcr:requiredType': "UNDEFINED",
			'jcr:multiple': true,
			'jcr:availableQueryOperators': [],
			'jcr:isFullTextSearchable': false,
			'jcr:isQueryOrderable': false
		},{ 
			'jcr:name': '*',
			'jcr:autoCreated': false,
			'jcr:mandatory': false,
			'jcr:onParentVersion': "IGNORE",
			'jcr:protected': false,
			'jcr:requiredType': "UNDEFINED",
			'jcr:multiple': false,
			'jcr:availableQueryOperators': [],
			'jcr:isFullTextSearchable': false,
			'jcr:isQueryOrderable': false
		}],
	'jcr:childNodeDefinition': 
		[{
			'jcr:name': '*',
			'jcr:autoCreated': false,
			'jcr:mandatory': false,
			'jcr:onParentVersion': "IGNORE",
			'jcr:protected': false,
			'jcr:requiredPrimaryTypes': ['nt:base'],
			'jcr:sameNameSiblings': true
		}]
});