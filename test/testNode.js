var Repository = require('../src/Repository.js'),
	core = require("../dep/Nu-Q/src/NuQCore.js"),
	vows = require('vows'),
	assert = require('assert'),
	nodeSuite, testrepository,
	_ = require('util')
	// This is the coffee test compiled in js
	,nuqtests = require('../dep/Nu-Q/test/NodeImplTest.js');

nodeSuite = vows.describe('KaraCos Nu-Q test Node');

nodeSuite.addBatch({
	"Getting RootNode": {
		topic: function() {
			var self = this;
			new Repository({
				db: {
					dbname: "karacos_NodeSuite",
					dbhost: "127.0.0.1",
					dbport: 27017
				}
			},function(err, repository){
				testrepository = repository;
				repository.login({username: 'admin', password:'demo'}, "testWorkSpace",
						function(err, session){
					nuqtests.setSession(session);
					session.getRootNode(self.callback);
				});
			});
		},
		"Root Node returned": function(err, node) {
			nuqtests.setNode(node);
			assert.ok(node !== undefined,'Node object is undefined');
		}
	}
});

nodeSuite.addBatch(nuqtests.getSuite());

nodeSuite.addBatch({
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
exports.nodeSuite = nodeSuite;
