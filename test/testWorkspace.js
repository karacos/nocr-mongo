var Repository = require('../src/Repository.js'),
	core = require("../dep/Nu-Q/src/NuQCore.js"),
	vows = require('vows'),
	assert = require('assert'),
	workspaceSuite, testrepository,
	_ = require('util')
	// This is the coffee test compiled in js
	,nuqtestsNodeTypeManager = require('../dep/Nu-Q/test/NodeTypeManagerTest.js');

workspaceSuite = vows.describe('KaraCos Nu-Q test Workspace');
workspaceSuite.addBatch({
	"deleting Repository": {
		topic: function() {
			var self = this;
			new Repository({
				db: {
					dbname: "karacos_WorkspaceSuite",
					dbhost: "127.0.0.1",
					dbport: 27017
				}
			},function(err, repository){
				repository.drop(self.callback);
			});
		},
		"Repository deleted": function(err, node) {
			
		}
		}});
workspaceSuite.addBatch({
	"Getting RootNode": {
		topic: function() {
			var self = this;
			new Repository({
				db: {
					dbname: "karacos_WorkspaceSuite",
					dbhost: "127.0.0.1",
					dbport: 27017
				}
			},function(err, repository){
				testrepository = repository;
				repository.login({username: 'admin', password:'demo'}, "testWorkSpace",
						function(err, session){
					nuqtestsNodeTypeManager.setSession(session);
					session.getRootNode(self.callback);
				});
			});
		},
		"Root Node returned": function(err, node) {
			assert.ok(node !== undefined,'Node object is undefined');
		}
	}
});
workspaceSuite.addBatch(nuqtestsNodeTypeManager.getSuite());

workspaceSuite.addBatch({
	"Cleaning Repository": {
		topic: function() {
			// implementation specific method for dropping the repository
			testrepository.drop(this.callback);
		},
		"Drop repository": function(err, res) {
			assert.ok(err === null,"Error while deleting repository");
		}
	}
});

exports.workspaceSuite = workspaceSuite;