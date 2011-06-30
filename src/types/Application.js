var Base = require("./Base.js"),
	propertyTypes = require('./propertyTypes.js'),
	NodeType = require('NodeType.js');

/** 3.7.11.5 nt:resource p 52
 * This node type may be used to represent the content of a file. In particular, the
jcr:content subnode of an nt:file node will often be an nt:resource. Note
that the definition of this node type indicates multiple inheritance (see 3.7.6
Node Type Inheritance).

[nt:resource] > mix:mimeType, mix:lastModified
primaryitem jcr:data
- jcr:data (BINARY) mandatory
*/
Base.extend({
	'jcr:nodeTypeName': 'nt:resource',
	'jcr:supertypes': ['mix:mimeType','mix:lastModified'],
	'jcr:isAbstract': false,
	'jcr:isQueryable': false,
	'jcr:isMixin': false,
	'jcr:hasOrderableChildNodes': false,
	'jcr:primaryItemName': 'jcr:data',
	'jcr:propertyDefinition': 
		[{ 
			'jcr:name': 'jcr:data',
			'jcr:autoCreated': false,
			'jcr:mandatory': true,
			'jcr:onParentVersion': "IGNORE",
			'jcr:protected': false,
			'jcr:requiredType': "BINARY",
			'jcr:multiple': false,
			'jcr:availableQueryOperators': [],
			'jcr:isFullTextSearchable': false,
			'jcr:isQueryOrderable': false
		}]
});

/** 3.7.11.11 nt:address p 53
 * This node type may be used to represent the location of a JCR item not just
within a particular workspace but within the space of all workspaces in all JCR
repositories.
The jcr:protocol property stores a string holding the protocol through which
the target repository is to be accessed.
The jcr:host property stores a string holding the host name of the system
through which the repository is to be accessed.
The jcr:port property stores a string holding the port number through which the
target repository is to be accessed.
The semantics of these properties are left undefined but are assumed to be
known by the application. The names and descriptions of the properties are not
normative and the repository does not enforce any particular semantic
interpretation on them.
The jcr:repository property stores a string holding the name of the target
repository.
The jcr:workspace property stores the name of a workspace.
The jcr:path property stores a path to an item.
The jcr:id property stores a weak reference to a node.
In most cases either the jcr:path or the jcr:id property would be used, but not
both, since they may point to different nodes. If any of the properties other than
jcr:path and jcr:id are missing, the address can be interpreted as relative to
the current container at the same level as the missing specifier. For example, if
no repository is specified, then the address can be interpreted as referring to a
workspace and path or id within the current repository.

[nt:address]
- jcr:protocol (STRING)
- jcr:host (STRING)
- jcr:port (STRING)
- jcr:repository (STRING)
- jcr:workspace (STRING)
- jcr:path (PATH)
- jcr:id (WEAKREFERENCE)

*/
