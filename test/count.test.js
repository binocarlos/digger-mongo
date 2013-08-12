
var digger = require('digger.io');
var diggerdb = require('../src');
var Bridge = require('digger-bridge');
var XML = require('digger-xml');
var data = require('./fixtures/data');
var async = require('async');
var fs = require('fs');
var DB = require('../src/db');

describe('diggerdb:count', function(){


	it('should return the count', function(done){
		
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

			container('city:count').ship(function(results){
				results.attr('count').should.equal(8);
				done();
			})	
		})

	})

})