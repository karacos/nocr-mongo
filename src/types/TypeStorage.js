/**
3.7.14 Node Type Definition Storage
A repository may expose the definitions of its available node types in content
using the node types nt:nodeType, nt:propertyDefinition and
nt:childNodeDefinition. If a repository exposes node type definitions in
content, then that repository must also support the system node (see 3.11
System Node) and the node type definitions should be located below
/jcr:system/jcr:nodeTypes. Support for these node types also requires support
for same-name siblings (see 22 Same-Name Siblings).
*/

/**
 * 3.7.14.1 nt:nodeType
[nt:nodeType]
- jcr:nodeTypeName (NAME) protected mandatory
- jcr:supertypes (NAME) protected multiple
- jcr:isAbstract (BOOLEAN) protected mandatory
- jcr:isQueryable (BOOLEAN) protected mandatory
- jcr:isMixin (BOOLEAN) protected mandatory
- jcr:hasOrderableChildNodes (BOOLEAN) protected mandatory
- jcr:primaryItemName (NAME) protected
+ jcr:propertyDefinition (nt:propertyDefinition)
= nt:propertyDefinition protected sns
+ jcr:childNodeDefinition (nt:childNodeDefinition)
= nt:childNodeDefinition protected sns

This node type is used to store a node type definition. Property and child node
definitions within the node type definition are stored as same-name sibling nodes
of type nt:propertyDefinition and nt:childNodeDefinition.

 */

/**
 * 3.7.14.2 nt:propertyDefinition
[nt:propertyDefinition]
- jcr:name (NAME) protected
- jcr:autoCreated (BOOLEAN) protected mandatory
- jcr:mandatory (BOOLEAN) protected mandatory
- jcr:onParentVersion (STRING) protected mandatory
< 'COPY', 'VERSION', 'INITIALIZE', 'COMPUTE',
'IGNORE', 'ABORT'
- jcr:protected (BOOLEAN) protected mandatory
- jcr:requiredType (STRING) protected mandatory
< 'STRING', 'URI', 'BINARY', 'LONG', 'DOUBLE',
'DECIMAL', 'BOOLEAN', 'DATE', 'NAME', 'PATH',
'REFERENCE', 'WEAKREFERENCE', 'UNDEFINED'
- jcr:valueConstraints (STRING) protected multiple
- jcr:defaultValues (UNDEFINED) protected multiple
- jcr:multiple (BOOLEAN) protected mandatory
- jcr:availableQueryOperators (NAME) protected mandatory
multiple
- jcr:isFullTextSearchable (BOOLEAN) protected mandatory
- jcr:isQueryOrderable (BOOLEAN) protected mandatory


This node type used to store a property definition within a node type definition,
which itself is stored as an nt:nodeType node.
 */

/**
 * 3.7.14.3 nt:childNodeDefinition

[nt:childNodeDefinition]
- jcr:name (NAME) protected
- jcr:autoCreated (BOOLEAN) protected mandatory
- jcr:mandatory (BOOLEAN) protected mandatory
- jcr:onParentVersion (STRING) protected mandatory
< 'COPY', 'VERSION', 'INITIALIZE', 'COMPUTE',
'IGNORE', 'ABORT'
- jcr:protected (BOOLEAN) protected mandatory
- jcr:requiredPrimaryTypes (NAME) = 'nt:base' protected
mandatory multiple
- jcr:defaultPrimaryType (NAME) protected
- jcr:sameNameSiblings (BOOLEAN) protected mandatory

 * This node type used to store a child node definition within a node type definition,
 * which itself is stored as an nt:nodeType node.
 */