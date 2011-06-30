var NodeType = require('NodeType.js'),
	propertyTypes = require('./propertyTypes.js');

/** 3.7.11.7 mix:created p53
 * This mixin node type can be used to add standardized creation information
properties to a node. In implementations that make these properties protected,
their values are controlled by the repository, which should set them appropriately
upon the initial persist of a node with this mixin type. In cases where this mixin is
added to an already existing node the semantics of these properties are
implementation specific (see 10.10.3 Assigning Mixin Node Types).

	[mix:created] mixin
		- jcr:created (DATE) autocreated protected? OPV?
		- jcr:createdBy (STRING) autocreated protected? OPV?
*/
new NodeType({
	'jcr:nodeTypeName': 'mix:created',
	'jcr:supertypes': [],
	'jcr:isAbstract': false,
	'jcr:isQueryable': true,
	'jcr:isMixin': false,
	'jcr:hasOrderableChildNodes': false,
	'jcr:propertyDefinition': 
		[{ 
			'jcr:name': 'jcr:created',
			'jcr:autoCreated': true,
			'jcr:mandatory': false,
			'jcr:onParentVersion': "IGNORE",
			'jcr:protected': false,
			'jcr:requiredType': "DATE",
			'jcr:multiple': false,
			'jcr:availableQueryOperators': [],
			'jcr:isFullTextSearchable': false,
			'jcr:isQueryOrderable': false
		},{ 
			'jcr:name': 'jcr:createdBy',
			'jcr:autoCreated': true,
			'jcr:mandatory': false,
			'jcr:onParentVersion': "IGNORE",
			'jcr:protected': false,
			'jcr:requiredType': "STRING",
			'jcr:multiple': false,
			'jcr:availableQueryOperators': [],
			'jcr:isFullTextSearchable': false,
			'jcr:isQueryOrderable': false
		}]
});

/** 3.7.11.6 mix:title
 * This mixin node type can be used to add standardized title and description
properties to a node.

[mix:title] mixin
- jcr:title (STRING) protected? OPV?
- jcr:description (STRING) protected? OPV?
*/

/** 3.7.11.8 mix:lastModified
This mixin node type can be used to provide standardized modification
information properties to a node. In implementations that make these properties
protected, their values are controlled by the repository, which should set them
appropriately upon a significant modification of the subgraph of a node with this
mixin. What constitutes a significant modification will depend on the semantics of
the various parts of a node's subgraph and is implementation-dependent.

[mix:lastModified] mixin
- jcr:lastModified (DATE) autocreated protected? OPV?
- jcr:lastModifiedBy (STRING) autocreated protected? OPV?
*/

/** 3.7.11.9 mix:language

[mix:language] mixin
- jcr:language (STRING) protected? OPV?
 * This mixin node type can be used to provide a standardized property that
specifies the natural language in which the content of a node is expressed. The
value of the jcr:language property should be a language code as defined in RFC
46465. Examples include 'en' (English), 'en-US' (United States English), 'de'
(German) and 'de-CH' (Swiss German).
*/


/**
3.7.11.10 mix:mimeType

This mixin node type can be used to provide standardized mimetype and
encoding properties to a node.
If a node of this type has a primary item that is a single-value BINARY property
then jcr:mimeType property indicates the media type6 applicable to the contents
of that property and, if that media type is one to which a text encoding applies,
the jcr:encoding property indicates the character set7 used.
If a node of this type does not meet the above precondition then the
interpretation of the jcr:mimeType and jcr:encoding properties is
implementation-dependent.

[mix:mimeType] mixin
- jcr:mimeType (STRING) protected? OPV?
- jcr:encoding (STRING) protected? OPV?
*/