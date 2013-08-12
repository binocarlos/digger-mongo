var Mongo = require('../src');

var XML = require('digger-xml');
var Reception = require('digger-reception');
var Bridge = require('digger-bridge');

var data = require('./fixtures/data');
var async = require('async');
var fs = require('fs');

describe('digger-mongo', function(){

	var bridge = null;
	var app = null;

	before(function(done){

		app = Reception({
			log:false
		});

		var server = app.listen(8799, function(){
			done();
		})

		bridge = Bridge({
			port:8799
		});
  })

	it('should allow the database to be reset', function(done){

		this.timeout(2000);
		
		var mongo_supplier = Mongo({
			database:'test',
			nocache:true
		});

		mongo_supplier.provision('collection');

		app.digger('/test1/mongo1', mongo_supplier);

		var supplychain1 = bridge.connect('/test1/mongo1/colors');

		function getdata(){
			var data = [{
				name:'Red',
				height:343
			},{
				name:'Blue',
				height:346,
				_children:[{
					test:10,
					_digger:{
						tag:'test'
					}
				}]
			},{
				name:'Yellow',
				height:8378
			}]

			var container = bridge.container(data);
			container.tag('color');

			return container;
		}

		var data = getdata();

		supplychain1.append(getdata()).ship(function(){

			var mongo_supplier2 = Mongo({
				database:'test',
				reset:true,
				nocache:true
			});

			mongo_supplier2.provision('collection');

			app.digger('/test2/mongo2', mongo_supplier2);

			var supplychain2 = bridge.connect('/test2/mongo2/colors');

			supplychain2.append(getdata()).ship(function(){

				supplychain2('color').ship(function(colors){

					colors.count().should.equal(3);
					colors.tag().should.equal('color');

					done();
					
				})

			})
			

		})

		
		
	})


	it('should insert and find test data', function(done){
		
		this.timeout(2000);

		var data = XML.parse(require(__dirname + '/fixtures/data').simplexml);
		var datac = bridge.container(data);

		var mongo_supplier = Mongo({
			database:'test',
			collection:'test2',
			nocache:true,
			reset:true
		});

		app.digger('/test2/mongo1', mongo_supplier);

		var supplychain1 = bridge.connect('/test2/mongo1');

		var simpleadd = bridge.container('simple', {
			name:'test',
			height:34
		})

		supplychain1.append(simpleadd).ship(function(){
			supplychain1('simple').ship(function(items){
				items.count().should.equal(1);
				items.tag().should.equal('simple');
				items.attr('height').should.equal(34);
				done();
			})
		})

	})

/*
	it('should insert and find big test data', function(done){
		
		this.timeout(2000);

		var data = XML.parse(require(__dirname + '/fixtures/data').simplexml);
		var datac = bridge.container(data);

		var db = diggerdb({
			collection:'test',
			reset:true
		})

		var container = Bridge(db).connect();

		container.append(datac).ship(function(){

			container('city.south').ship(function(cities){
				cities.count().should.equal(3);
				done();
			})
		})

	})

	it('should save', function(done){
		
		this.timeout(2000);

		var data = XML.parse(require(__dirname + '/fixtures/data').citiesxml);
		var datac = Bridge.container(data);

		var db = diggerdb({
			collection:'test',
			reset:true
		})

		var supplychain = Bridge(db);

		var container = supplychain.connect();

		container.append(datac).ship(function(){
			container('city.south').ship(function(cities){
				cities.count().should.equal(3);

				cities.eq(0).attr('testme', 'hello').save().ship(function(){

					container('city.south[testme=hello]').ship(function(cities){
						
						cities.count().should.equal(1);
						done();
					})
				})
			})
		})


	})

	it('should remove', function(done){
		
		this.timeout(2000);

		var data = XML.parse(require(__dirname + '/fixtures/data').citiesxml);
		var datac = Bridge.container(data);

		var db = diggerdb({
			collection:'test',
			reset:true
		})

		var container = Bridge(db).connect();

		container.append(datac).ship(function(){
			container('city.south').ship(function(cities){
				cities.count().should.equal(3);

				cities.eq(0).remove().ship(function(){

					container('city.south').ship(function(cities){
						
						cities.count().should.equal(2);
						done();
					})
				})
			})
		})
		

	})

	it('should load from within an already loaded container', function(done){
		
		this.timeout(2000);

		var data = XML.parse(require(__dirname + '/fixtures/data').citiesxml);
		var datac = Bridge.container(data);

		var db = diggerdb({
			collection:'test',
			reset:true
		})

		var container = Bridge(db).connect();

		container.append(datac).ship(function(){

			container('city.south').ship(function(cities){

				cities('area.poor').ship(function(results){
					results.count().should.equal(3);
					done();
				})

			})

		})

	})


	it('should load children based on the tree modifier', function(done){
		
		this.timeout(2000);

		var data = XML.parse(require(__dirname + '/fixtures/data').citiesxml);
		var datac = Bridge.container(data);

		var db = diggerdb({
			collection:'test',
			reset:true
		})

		var container = Bridge(db).connect();

		container.append(datac).ship(function(){

			container('city.south:tree').ship(function(cities){

				cities.count().should.equal(3);
				cities.find('area').count().should.equal(8);
				done();

			})

		})

	})

	it('should provision into a collection based on the path', function(done){
		
		this.timeout(2000);

		var data = XML.parse(require(__dirname + '/fixtures/data').citiesxml);
		var datac = Bridge.container(data);

		var db = diggerdb({
			provider:'collection',
			url:'/mongo',
			reset:true
		})

		var container = Bridge(db).connect('/mongo/testprovider');

		container.append(datac).ship(function(){

			container('city.south:tree').ship(function(cities){

				cities.count().should.equal(3);
				cities.find('area').count().should.equal(8);

				var details =  {
					hostname:'127.0.0.1',
					port:27017,
					database:'digger',
					collection:'testprovider',
					reset:false
				}

				DB(details, function(error, collection){
					var cursor = collection.find({
						'$and':[{
							'_digger.tag':'city'
						},{
							'_digger.class':'south'
						}]
					}, null, {})

					cursor.toArray(function(error, docs){
						docs.length.should.equal(3);
						done();
					})
				})

			})

		})

	})

	it('should provision into a database and collection based on the path', function(done){
		
		this.timeout(2000);
		
		var data = XML.parse(require(__dirname + '/fixtures/data').citiesxml);
		var datac = Bridge.container(data);

		var db = diggerdb({
			provider:'database',
			url:'/mongo',
			reset:true
		})

		var container = Bridge(db).connect('/mongo/testdb/testprovider');

		container.append(datac).ship(function(){

			container('city.south:tree').ship(function(cities){

				cities.count().should.equal(3);
				cities.find('area').count().should.equal(8);

				var details =  {
					hostname:'127.0.0.1',
					port:27017,
					database:'testdb',
					collection:'testprovider',
					reset:false
				}

				DB(details, function(error, collection){
					var cursor = collection.find({
						'$and':[{
							'_digger.tag':'city'
						},{
							'_digger.class':'south'
						}]
					}, null, {})

					cursor.toArray(function(error, docs){
						docs.length.should.equal(3);
						done();
					})
				})

			})

		})

	})
*/
})