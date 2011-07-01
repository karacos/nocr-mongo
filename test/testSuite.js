var Repository = require('../src/Repository.js'),
	core = require("../dep/Nu-Q/src/NuQCore.js"),
	vows = require('vows'),
	assert = require('assert'),
	testSuite, testrepository,
	_ = require('util')
	// This is the coffee test compiled in js
	,nocrTests = require('../dep/Nu-Q/test/ImplTest.js');

testSuite = vows.describe('KaraCos Nu-Q test Suite');
testSuite.addBatch({
	"Clearing Database": {
		topic: function() {
			var self = this;
			new Repository({
				db: {
					dbname: "karacos_testSuite",
					dbhost: "127.0.0.1",
					dbport: 27017
				}
			},function(err, repository){
				repository.drop(self.callback);
			});
		},
		"Repository deleted": function(err, node) {
			assert.ok(err === null, "Error is not Null");
		}}});
testSuite.addBatch({
	"[Karacos] Creating a new repository": {
		topic: function() {
			var self = this;
			new Repository({
				db: {
					dbname: "karacos_testSuite",
					dbhost: "127.0.0.1",
					dbport: 27017
				}
			},this.callback);
		},
		"Assigning repository to delegate tests of NoCR API": function(err, repository) {
			assert.ok(repository !== undefined,'Repository object is undefined');
			nocrTests.setRepository(repository);
		},
		'Testing admin default login': {
			topic: function(){
				nocrTests.getRepository().login({username: 'admin', password:'demo'}, "testWorkSpace",this.callback);
			},
			'Test Session object' : function(err,session){
				assert.ok((session instanceof core.Session),'Session is not a session object');
				nocrTests.setSession(session);
			}
		},
		'Testing admin wrong password login': {
			topic: function(){
				nocrTests.getRepository().login({username: 'admin', password:'notdemo'}, "testWorkSpace",this.callback);
			},
			'Test result error' : function(err,session){
				_.debug(_.inspect(err));
				_.debug(typeof err);
				assert.ok(typeof err === 'string','Error must be a String');
				assert.ok((session === null || session === undefined),'Session is not null');
			}
		}
	}});

testSuite.addBatch({
	"[Karacos] Default repository values": {
		"Getting root Node": {
			topic: function() {
				nocrTests.getSession().getRootNode(this.callback);
			},
			"Root Node returned": function(err, node) {
				nocrTests.setNode(node);
				assert.ok(node !== undefined,'Node object is undefined');
			}}}});
nocrTests.addNoCRBatch(testSuite);

testSuite.addBatch({
	"[Karacos] Cleanup": {
		topic: function() {
			// implementation specific method for dropping the repository
			nocrTests.getRepository().drop(this.callback);
		},
		"Drop repository": function(err, res) {
			if (err != null) {
				console.log(err);
			}
			assert.ok(err === null,"Error while deleting repository");
		}
	}
});
exports.testSuite = testSuite;