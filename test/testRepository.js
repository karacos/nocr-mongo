var Repository = require('../src/Repository.js'),
	core = require("../dep/Nu-Q/src/NuQCore.js"),
	vows = require('vows'),
	assert = require('assert'),
	repositorySuite,
	_ = require('util')
	,nuqtests = require('../dep/Nu-Q/test/RepositoryImplTest.js');


repositorySuite = vows.describe('KaraCos Nu-Q test');
repositorySuite.addBatch({
	"Testing new Repository": {
		topic: function() {
			new Repository({
				db: {
					dbname: "karacos_wrapperSuite",
					dbhost: "127.0.0.1",
					dbport: 27017
				}
			},this.callback);
		},
		"Can get repository": function(err, repo) {
			nuqtests.setRepositoryInstance(repo);
			if (err !== null) {
				_.log(err);
			}
			assert.ok(err === null, "An error was thrown");
		}
	}
});
repositorySuite.addBatch({
		'[karacos] Testing admin default login': {
			topic: function(){
				nuqtests.getRepository().login({username: 'admin', password:'demo'}, "testWorkSpace",this.callback);
			},
			'Test Session object' : function(err,session){
				_.debug(err);
				assert.ok((session instanceof core.Session),'Session is not a session object');
			}
		}})
repositorySuite.addBatch(nuqtests.getSuite());
repositorySuite.addBatch({
	"Cleanup": {
		topic: function() {
			nuqtests.getRepository().drop(this.callback);
		},
		"Drop repository": function(err, res) {
			if (err != null) {
				console.log(err);
			}
			assert.ok(err === null,"Error while deleting repository");
		}
	}
});
exports.repositorySuite = repositorySuite;