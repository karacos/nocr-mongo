var core = require("../dep/Nu-Q/src/NuQCore.js"),
	_ = require('util'),
	wrapper = require('./wrapper.js'),
	Node = require('./Node.js'),
	Workspace = require('./Workspace.js'),
	Session;

Session = function(repository, credentials, callback) {
	var self = this,
		client = repository.client,
		workspaces, usersCollection;
// ============================================================
// ------------------------------- Private methods declatations
// ============================================================

	function assignWorkspace() {
		workspaces.find({'name':self.user.workspace}).limit(1).
			toArray(function(err, items) {
				if (items.length === 0) {
					callback("Error while fetching item", null);
				}
				new Workspace(self,items[0],function(err, ws) {
					self.workspace = ws;
					callback(null,self);
					
				});
			});
	}
	function setUserContext(){
		client.collection('repository.workspaces', function(err, collection) {
			workspaces = collection;
			workspaces.count(function(err, count) {
				if (count === 0) {
					collection.createIndex([['name', 1]], true, function(err, result) {
						collection.save(
								[{'name':'default'}, {'name': 'admin'}],
								 {safe:true},
								 function() {
									 assignWorkspace();
								 });
					});
				} else {
					assignWorkspace();
				}
			});
			
		});
	}
	/**
	 * Check authentication
	 * 
	 * TODO: encrypt passwords
	 * 
	 * @param err
	 * @param users
	 */
	function checkUserAuth(err, users){
		var user = users[0];
		if(err) {
			callback(err, null);
		} else if(user) {
			_.debug("user found :" + _.inspect(users));
			if (user.password === credentials.password) {
				self.user = {username:user.username, id: user.userid, workspace:user.workspace};
				setUserContext();
			} else {
				setAnonymous();
				callback("Error, password does not match", null);
			}
		}
	}
	function setAnonymous() {
		self.user = {username:'anonymous', id: -1, workspace:'default'};
		setUserContext();
	};
	/**
	 * Validates an authentication request
	 * @returns
	 */
	function validateAuth() {
		if (credentials === null) {
			_.debug('No credentials provided, providing anonymous user');
			setAnonymous();
			callback(null, self);
		} else {
			_.debug("credentials != null :" + _.inspect(credentials));
			if (credentials.username !== undefined || credentials.username !== null) {
				_.debug("credentials provided :" + _.inspect(credentials));
				usersCollection.find({username: credentials.username}).limit(1).
					toArray(checkUserAuth);
			} else {
				setAnonymous();
				callback(null, self);
			}
		}
	}
	/**
	 * session initialization
	 */
	function initSession() {
		if (credentials === undefined) {credentials = null;}
		self.repository = repository;
		function processUsersCollection(err, collection) {
			collection.count(function(err, count) {
				usersCollection = collection;
				if (count === 0) {
					_.debug('No user found in db, creating defaults: anonymous and admin');
					collection.createIndex([['username', 1]], true, function(err, result) {
						collection.save(
								[{'username':'admin','password': 'demo', userid: 0,workspace:'admin'},
								 {'username':'anonymous', userid: -1,workspace:'default'}],
								 {safe:true},
								 function() {
									 validateAuth();
								 });
					});
				} else {
					validateAuth();
				}
			});
		}
		client.collection('repository_users', processUsersCollection);
	}

// ============================================================
// ------------------------------- Public methods declatations
// ============================================================
	/**
	 * returns the current Repository
	 */
	self.getRepository = function() {
		if (typeof self.repository === "undefined") {
			throw new Error('Critical problem, repository is undefined');
		}
		return self.repository;
	};
	/**
	 *  returns the current Repository
	 */
	self.getWorkspace = function() {
		if (typeof self.workspace === "undefined") {
			throw new Error('Critical problem, workspace is undefined');
		}
		return self.workspace;
	};
	self.getUserID = function() {
		return self.user.userid;
	};
	self.getRepository = function() {
		return self.repository;
	};
	self.isLive = function() {
		return true;
	};
	self.logout = function() {
		
	};
	/**
	 * Returns the attached Repository's root
	 */
	self.getRootNode = function(callback) {
		//according 3.10.1.1 p65 : The root nodes of all workspaces in a repository
		// all have the same identifier, and therefore correspond to one another.
		self.getNode('/',callback);
	};
		
	
	initSession();
};

_.inherits(Session,core.Session);

module.exports = Session;