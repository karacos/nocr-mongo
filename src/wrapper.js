var mongodb = process.env['TEST_NATIVE'] != null ? require('mongodb').native() : require('mongodb').pure(),
	Db = mongodb.Db,
	Server = mongodb.Server;

/**
 * 
 * @param object configuration object for client
 * @param callback
 * @returns an open client to the database
 */
function getClient(object, callback) {
	var
		params = {auto_reconnect: true, poolSize: 4, native_parser: (process.env['TEST_NATIVE'] != null) ? true : false},
		server,
		client;
	if (typeof object.params !== "undefined") {
		params = object.params;
	}
	if (typeof callback === undefined) {
		throw new Error("missing parameter: callback");
	}
	server = new Server(object.dbhost, object.dbport,params);
	client = new Db(object.dbname, server);
	client.open(function(err, db_p){
		if (err === null) {
			callback(null, client);
		} else {
			callback(err);
		}
	});
}

exports.getClient = getClient;

