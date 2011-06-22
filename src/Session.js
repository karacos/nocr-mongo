var core = require("../dep/Nu-Q/src/NuQCore.js"),
	_ = require('util'),
	wrapper = require('./wrapper.js'),
	Node = require('./Node.js'),
	Session;

Session = function(repository, credentials, callback) {
	var self = this,
		client = repository.client;
	if (credentials === undefined) {credentials = null;}
	this.repository = repository;
	this.getRepository = function() {
		return self.repository;
	};
	function setAnonymous() {
		self.user = {username:'anonymous', id: -1};
	};
	function initSession() {
		function checkUserAuth(err, users){
			var user = users[0];
			if(err) {
				callback(err, null);
			} else if(user) {
				_.debug("user found :" + _.inspect(users));
				if (user.password === credentials.password) {
					self.user = {username: user.username, userid: user.userid};
					setAnonymous();
					callback(null, self);
				} else {
					callback("Error, password does not match", null);
				}
			}
		}
		function validateAuth(collection) {
			if (credentials === null) {
				_.debug('No credentials provided, providing anonymous user');
				setAnonymous();
				callback(null, self);
			} else {
				_.debug("credentials != null :" + _.inspect(credentials));
				if (credentials.username !== undefined || credentials.username !== null) {
					_.debug("credentials provided :" + _.inspect(credentials));
					collection.find({username: credentials.username}).limit(1).
					toArray(checkUserAuth);
				} else {
					setAnonymous();
					callback(null, self);
				}
			}
		}
		function processUsersCollection(err, collection) {
			collection.count(function(err, count) {
				if (count === 0) {
					_.debug('No user found in db, creating defaults: anonymous and admin');
					collection.createIndex([['username', 1]], true, function(err, result) {
						collection.save(
								[{'username':'admin','password': 'demo', userid: 0},
								 {'username':'anonymous', userid: -1}],
								 {safe:true},
								 function() {
									 validateAuth(collection);
								 });
					});
				} else {
					validateAuth(collection);
				}
			});
		}
		client.collection('repository_users', processUsersCollection);
	}
//	client.createCollection('test_collection_methods', function(err, collection) {});
	this.getUserID = function() {
		return self.user.userid;
	};
	this.getRepository = function() {
		return self.repository;
	};
	this.isLive = function() {
		return true;
	};
	this.logout = function() {
		
	};
	/**
	 * Returns the attached Repository's root
	 */
	this.getRootNode = function(callback) {
		self.repository.getRootNode(callback);
	};
	
	this.getNode = function(abspath, callback) {
		self.repository.getNode(abspath,callback);
		};
	initSession();
};

_.inherits(Session,core.Session);

module.exports = Session;