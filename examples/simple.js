var Reception = require('digger-reception');
var Mongo = require('../src');

var app = Reception();

/*

	the mongo route
	
*/
var mongo_supplier = Mongo();

mongo_supplier.provision('database', 'collection');

app.digger('/mongo', mongo_supplier);
	
var server = app.listen(8791, function(){
	console.log('-------------------------------------------');
	console.log('listening on port: ' + 8791);
})