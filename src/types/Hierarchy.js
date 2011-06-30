var Base = require("./Base.js"),
	Hierarchy,
	propertyTypes = require('./propertyTypes.js'),
	NodeType = require('./NodeType.js');
/** 
3.7.11.1 nt:hierarchyNode
[nt:hierarchyNode] > mix:created abstract
This abstract node type serves as the supertype of nt:file and nt:folder and
inherits the item definitions of mix:created and so requires the presence of that
node type (see 3.7.11.7 mix:created).

 */
Hierarchy = Base.extend({
	'jcr:nodeTypeName': 'nt:hierarchyNode',
	'jcr:supertypes': ['mix:created'],
	'jcr:isAbstract': true,
	'jcr:isQueryable': false,
	'jcr:isMixin': false,
	'jcr:hasOrderableChildNodes': false
});
/**
 * 3.7.11.4 nt:folder

[nt:folder] > nt:hierarchyNode
+ * (nt:hierarchyNode) VERSION

Nodes of this type may be used to represent folders or directories. This node type
inherits the item definitions of nt:hierarchyNode and adds the ability to have
any number of other nt:hierarchyNode child nodes with any names. This means,
in particular, that it can have child nodes of types nt:folder, nt:file or
nt:linkedFile.

 */
Hierarchy.extend({
	'jcr:nodeTypeName': 'nt:folder',
	'jcr:supertypes': ['nt:hierarchyNode'],
	'jcr:isAbstract': false,
	'jcr:isQueryable': true,
	'jcr:isMixin': false,
	'jcr:hasOrderableChildNodes': false,
	'jcr:childNodeDefinition': 
		[{
			'jcr:name': '*',
			'jcr:autoCreated': false,
			'jcr:mandatory': false,
			'jcr:onParentVersion': "IGNORE",
			'jcr:protected': false,
			'jcr:requiredPrimaryTypes': ['nt:hierarchyNode'],
			'jcr:sameNameSiblings': true
		}]
});

/**
3.7.11.2 nt:file
[nt:file] > nt:hierarchyNode primaryitem jcr:content
+ jcr:content (nt:base) mandatory
Nodes of this node type may be used to represent files. This node type inherits
the item definitions of nt:hierarchyNode and requires a single child node called
jcr:content. The jcr:content node is used to hold the actual content of the
file. This child node is mandatory, but not auto-created. Its node type will be
application-dependent and therefore it must be added by the user. A common
approach is to make the jcr:content a node of type nt:resource. The
jcr:content child node is also designated as the primary child item of its parent.

 */
Hierarchy.extend({
	'jcr:nodeTypeName': 'nt:file',
	'jcr:supertypes': ['nt:hierarchyNode'],
	'jcr:isAbstract': false,
	'jcr:isQueryable': true,
	'jcr:isMixin': false,
	'jcr:hasOrderableChildNodes': false,
	'jcr:primaryItemName': 'jcr:content',
	'jcr:childNodeDefinition': 
		[{
			'jcr:name': 'jcr:content',
			'jcr:autoCreated': false,
			'jcr:mandatory': true,
			'jcr:onParentVersion': "IGNORE",
			'jcr:protected': false,
			'jcr:requiredPrimaryTypes': ['nt:base'],
			'jcr:sameNameSiblings': false
		}]
});

/**
3.7.11.3 nt:linkedFile
[nt:linkedFile] > nt:hierarchyNode primaryitem jcr:content
- jcr:content (REFERENCE) mandatory
The nt:linkedFile node type is similar to nt:file, except that the content node
is not stored directly as a child node, but rather is specified by a REFERENCE
property. This allows the content node to reside anywhere in the workspace and
to be referenced by multiple nt:linkedFile nodes. The content node must be
referenceable. Support for this node type requires support for referenceable
nodes with referential integrity (see 3.8.2 Referential Integrity).
*/
Hierarchy.extend({
	'jcr:nodeTypeName': 'nt:linkedFile',
	'jcr:supertypes': ['nt:hierarchyNode'],
	'jcr:isAbstract': false,
	'jcr:isQueryable': true,
	'jcr:isMixin': false,
	'jcr:hasOrderableChildNodes': false,
	'jcr:primaryItemName': 'jcr:content',
	'jcr:propertyDefinition': 
		[{ 
			'jcr:name': 'jcr:content',
			'jcr:autoCreated': false,
			'jcr:mandatory': true,
			'jcr:onParentVersion': "IGNORE",
			'jcr:protected': false,
			'jcr:requiredType': "REFERENCE",
			'jcr:multiple': false,
			'jcr:availableQueryOperators': [],
			'jcr:isFullTextSearchable': false,
			'jcr:isQueryOrderable': false
		}]
});
