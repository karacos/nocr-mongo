var Repository = require('../src/Repository.js'),
	core = require("../dep/Nu-Q/src/NuQCore.js"),
	vows = require('vows'),
	assert = require('assert'),
	repositorySuite, apiSuite,
	_ = require('util'),
	testRepository
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
			testRepository = repo;
//			 Setting the topic of apisuite
			apiSuite.topic = testRepository;
//			console.log(this.context);
//			this.context["API Test suite"] = nuqtests.implSuite(testRepository);
			if (err !== null) {
				_.log(err);
			}
			assert.ok(err === null, "An error was thrown");
		}
	}
});
apiSuite = nuqtests.getSuite();
repositorySuite.addBatch(apiSuite);
//repositorySuite.addBatch({"API Test suite": nuqtests.implSuite(testRepository)});
	

exports.repositorySuite = repositorySuite;