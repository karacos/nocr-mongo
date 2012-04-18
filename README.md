# KaraCos NoCR using MongoDB

## Getting started

KaraCos-NoCR-MongoDB is a content repository implementing the  NoCR API, a JCR close, but asynchronous content repository API.

### Installation

You only need nodejs and npm to start using nocr-mongo in you project.

```
npm install nocr-mongo
```

### Using nocr-mongo

```
var nocrMongo = require('nocr-mongo');

Repository = new nocrMongo.Repository({
	db: {
		dbname: "my_mongo_db_name", // creates the db if not already exists
		dbhost: "127.0.0.1", // default mongodb if you have it installed locally
		dbport: 27017 // default mongodb port
	}
	}, function(err, repository) {
		// login with default username and password (nocr-mongo doesn't provices yet a way to change this.
		repository.login({'username': "admin", 'password': "demo"}, function(err, session) {
			// you may use the session object as describes in NoCR API
			session.getRootNode(function(err, rootNode) {
				rootNode.addNode('myNode', 'nt:undefined', function(err, myNode) {
					myNode.setProperty("myproperty", "mavaleur", function(err, myProperty){
						//do whatever you want with property, or something else.
						session.save(); //persist data and indexes in mongodb
					});
				});
			});
		});
	});
```

### Running testsuite

```
cd nocr-mongo
npm link
vows test/testSuite.js --spec
```