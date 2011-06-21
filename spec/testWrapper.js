/**
 * 
 */

var wrapper = require('../src/wrapper.js'),
	vows = require('vows'),
	assert = require('assert'),
	wrapperSuite;

wrapperSuite = vows.describe('testWrapper Suite');


wrapperSuite.addBatch({
	"Test getClient":{
		topic: function() {
			wrapper.getClient({
				dbname: "karacos_wrapperSuite",
				dbhost: "127.0.0.1",
				dbport: 27017
			},this.callback);
		},
		"getClient result": function(err, rs_client) {
					assert.ok(err === null);
					client = rs_client;
					//console.error(client);
		}
	}
});

exports.wrapperSuite = wrapperSuite;
