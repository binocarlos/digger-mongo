
var digger = require('digger.io');
var diggerdb = require('../src');
var data = require('./fixtures/data');
var async = require('async');
var XML = require('digger-xml');
var Bridge = require('digger-bridge');
var fs = require('fs');
var DB = require('../src/db');

describe('diggerdb:self', function(){


	it('should run a self selector', function(done){
		
		this.timeout(2000);

		var data = XML.parse(require(__dirname + '/fixtures/data').citiesxml);
		var datac = Bridge.container(data);

		var db = diggerdb({
			collection:'test',
			reset:true
		})

		var supplychain = Bridge(db).connect();

		supplychain.append(datac).ship(function(){
			var container = Bridge(db).connect();

			container('city:limit(1)').ship(function(results){
				results('self').ship(function(tree){					
					
					tree.diggerid().should.equal(results.diggerid());
					
					done();
				})
			})	
		})

	})

})