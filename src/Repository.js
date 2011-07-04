var nocr = require("NoCR"),
	_ = require('util'),
	wrapper = require('./wrapper.js'),
	Session = require('./Session.js'),
	Node = require('./Node.js'),
	Item = require('./Item.js');
	Repository,
	nodeTypeManager = require('./types/nodeTypeManager.js');
/**
 * 
 * @param config an object representing the config:
 * 24.2 Repository Descriptors p 262
 * ```
 * {
 *     'db': { // database parameters
 *       
 *       },
 *     'nodes': { // node cache object handler
 *       getNode: function(abspath,callback) {}, params of callback :(error, Node)
 *       setNode: function(abspath, node, callback) {}: (error, Node) 
 *       }
 *     }
 * ```
 * 
 * @param callback (err, Repository)
 * @returns {Repository}
 */

function Repository(config, callback) {
	var self = this;
	
	function getItemsCollection(callback) {
		if (self.itemsCollection !== undefined) {
			callback(null, self.itemsCollection);
		} else {
			self.client.collection('repository.items', function(err, itemsCollection) {
				if (err === null) {
					self.itemsCollection = itemsCollection;
					self.itemsCollection.count(function(err, count) {
						if (count === 0) {
							callback(err, self.itemsCollection);
						} else {
							callback(err, self.itemsCollection);
						}
					});
				} else {
					_.error(err);
					callback(err);
				}
			});
		}
	}
	
    this.login = function(credentials, workspaceName, callback) {
    	var 
    		session = new Session(self,credentials, function(err,sess) {
    			if (callback !== undefined) {
    				callback(err, sess);
    			}
    		});
    };
    
    /**
     * Implementation specific method, drop the repository storage
     */
    this.drop = function(callback) {
    	self.client.dropDatabase(function(err, done) {
    		if (err !== null) {
    			_.debug('fail removing database');
    			callback(err,done);
    		} else {
    			console.log(done);
    			_.debug('database removed successfully');
    			self.client.close();
    			callback(null,"Database drop command successful, repository deleted");
    		}
    	});
    };
    /**
     * Implementation specific method
     */
    this.getRootNode = function(callback) {
    	var self = this;
    	
    	function createRootNode() {
    		getItemsCollection(function(err, collection){
	    		collection.insert({
	    			'classType': 'Node',
					'primaryNodeType': 'nt:unstructured'
	    			// path: abspath -- This is my repository root node
	    		}, {safe: true}, function(err, result) {
	    			if (err !== null) {
	    				callback(err);
	    			} else {
	    				self.rootNode = new Node(nodeTypeManager.getNodeType(result[0]['primaryNodeType']) ,result[0]);
	    				//console.log(self.rootNode);
	    				callback(err, self.rootNode);
	    			}
	    		});
    		});
    	}
    	if (typeof self.rootNode !== 'undefined') {
    		callback(err, self.rootNode);
    	} else {
    		createRootNode();
    	}
    };
    // process the repository Initialization
    if (typeof config === "undefined" || config === null) {
        throw new Error("Missing options parameter");
    }
    
    this.getDataById = function(dataId,callback) {
    	var objectId;
    	if (typeof dataId === "string") {
    		objectId = new self.client.bson_serializer.ObjectID(dataId);
    	} else {
    		objectId = dataId;
    	}
    	
    	_.debug("Searching for id : " + objectId);
    	getItemsCollection(function(err, itemsCollection){
    		itemsCollection.find({"_id":objectId}).limit(1).toArray(function(err, item){
    			_.debug("Search for id : " + objectId + " found data :" + _.inspect(item[0]));
    			callback(err, item[0]);
    		});

    	});
    };
    
    this.config = config;
    wrapper.getClient(config.db, function(err, client){
    	if (err === null) {
    		self.client = client;
    		//console.log(self);
    		callback(null, self);
    	} else {
    		_.error(err);
    		callback(err);
    	}
    });
}

Repository.prototype = {
		stdDescriptors: {
			// Repository Information
			'SPEC_VERSION_DESC': "2.0",
			'SPEC_NAME_DESC': "Content Repository for javascript nodejs technology",
			'REP_VENDOR_DESC': "Karacos org",
			'REP_VENDOR_URL_DESC':"http://github.com/karacos/karacos-nuq-mongodb",
			'REP_NAME_DESC': "Karacos Nu-Q CR implementation for mongodb",
			'REP_VERSION_DESC': "0.1.1",
			// General Informations
			'WRITE_SUPPORTED': true,
			'IDENTIFIER_STABILITY': '', // TODO 'See 3.7 Identifiers', determine value for this impl
/*
 * IDENTIFIER_STABILITY_METHOD_DURATION: Identifiers may change between method calls
 * IDENTIFIER_STABILITY_SAVE_DURATION: Identifiers are guaranteed stable within a single save/refresh cycle.
 * IDENTIFIER_STABILITY_SESSION_DURATION: Identifiers are guaranteed stable within a single session.
 * IDENTIFIER_STABILITY_INDEFINITE_DURATION: Identifiers are guaranteed to be stable forever. Note that referenceable identifiers always have this level of stability.
 */
			'OPTION_XML_IMPORT_SUPPORTED': false, //TODO Implements in order to be true
			'OPTION_UNFILED_CONTENT_SUPPORTED': false,//TODO Implements in order to be true
			'OPTION_SIMPLE_VERSIONING_SUPPORTED': false,
			'OPTION_ACTIVITIES_SUPPORTED': false,
			'OPTION_BASELINES_SUPPORTED': false,
			'OPTION_ACCESS_CONTROL_SUPPORTED': false,
			'OPTION_LOCKING_SUPPORTED': false,
			'OPTION_OBSERVATION_SUPPORTED': false,
			'OPTION_JOURNALED_OBSERVATION_SUPPORTED': false,
			'OPTION_RETENTION_SUPPORTED': false,
			'OPTION_LIFECYCLE_SUPPORTED': false,
			'OPTION_TRANSACTIONS_SUPPORTED': false,
			'OPTION_WORKSPACE_MANAGEMENT_SUPPORTED': false,
			'OPTION_NODE_AND_PROPERTY_WITH_SAME_NAME_SUPPORTED': false,
			//
			// Nodes operation
			//
			'OPTION_UPDATE_PRIMARY_NODE_TYPE_SUPPORTED': false,
			'OPTION_UPDATE_MIXIN_NODE_TYPES_SUPPORTED': true,
			'OPTION_SHAREABLE_NODES_SUPPORTED': false,
			//
			//Node type management
			'OPTION_NODE_TYPE_MANAGEMENT_SUPPORTED': false,
			'NODE_TYPE_MANAGEMENT_INHERITANCE': false,
			'NODE_TYPE_MANAGEMENT_OVERRIDES_SUPPORTED': false,
			'NODE_TYPE_MANAGEMENT_PRIMARY_ITEM_NAME_SUPPORTED': false,
			'NODE_TYPE_MANAGEMENT_ORDERABLE_CHILD_NODES_SUPPORTED': false,
			'NODE_TYPE_MANAGEMENT_RESIDUAL_DEFINITIONS_SUPPORTED': false,
			'NODE_TYPE_MANAGEMENT_AUTOCREATED_DEFINITIONS_SUPPORTED': false,
			'NODE_TYPE_MANAGEMENT_SAME_NAME_SIBLINGS_SUPPORTED': false,
			'NODE_TYPE_MANAGEMENT_PROPERTY_TYPES': false,
			'NODE_TYPE_MANAGEMENT_MULTIVALUED_PROPERTIES_SUPPORTED': false,
			'NODE_TYPE_MANAGEMENT_MULTIPLE_BINARY_PROPERTIES_SUPPORTED': false,
			'NODE_TYPE_MANAGEMENT_VALUE_CONSTRAINTS_SUPPORTED': false,
			'NODE_TYPE_MANAGEMENT_UPDATE_IN_USE_SUPORTED': false,
			//
			// Query Languages
			'QUERY_LANGUAGES': [],
			'QUERY_STORED_QUERIES_SUPPORTED': false,
			'QUERY_FULL_TEXT_SEARCH_SUPPORTED': false,
			'QUERY_JOINS': 'QUERY_JOINS_NONE'
			/*
			 * QUERY_JOINS_NONE: Joins are not supported. Queries are limited to a single selector.
			 * QUERY_JOINS_INNER: Inner joins are supported.
			 * QUERY_JOINS_INNER_OUTER: Inner and outer joins are supported.
			 */
		}
};

_.inherits(Repository,nocr.Repository);

module.exports = Repository;