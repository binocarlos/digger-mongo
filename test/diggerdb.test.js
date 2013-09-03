var Mongo = require('../src');

var XML = require('digger-xml');
var Client = require('digger-client');
var data = require('./fixtures/data');
var async = require('async');
var fs = require('fs');

describe('digger-mongo', function(){

	it('should allow the database to be reset', function(done){

		this.timeout(2000);
		
		var mongo_supplier = Mongo({
			database:'test',
			nocache:true
		});

		mongo_supplier.provision('collection');

		var db = Client(mongo_supplier);

		var con

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


	it('should insert and find big test data', function(done){
		
		this.timeout(2000);

		var data = XML.parse(require(__dirname + '/fixtures/data').citiesxml);
		var datac = bridge.container(data);

		var mongo_supplier = Mongo({
			database:'test',
			collection:'test3',
			nocache:true,
			reset:true
		});

		app.digger('/test3/mongo1', mongo_supplier);

		var supplychain1 = bridge.connect('/test3/mongo1');

		supplychain1.append(datac).ship(function(){

			supplychain1('city.south').ship(function(cities){
				cities.count().should.equal(3);
				done();
			})
		})

	})


	it('should save', function(done){
		
		this.timeout(2000);

		var data = XML.parse(require(__dirname + '/fixtures/data').citiesxml);
		var datac = bridge.container(data);

		var mongo_supplier = Mongo({
			database:'test',
			collection:'test4',
			nocache:true,
			reset:true
		});

		app.digger('/test4/mongo1', mongo_supplier);

		var supplychain1 = bridge.connect('/test4/mongo1');

		supplychain1.append(datac).ship(function(){
			supplychain1('city.south').ship(function(cities){

				cities.count().should.equal(3);

				cities.eq(0).attr('testme', 'hello').save().ship(function(){

					supplychain1('city.south[testme=hello]').ship(function(cities){
						
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
		var datac = bridge.container(data);

		var mongo_supplier = Mongo({
			database:'test',
			collection:'test5',
			nocache:true,
			reset:true
		});

		app.digger('/test5/mongo1', mongo_supplier);

		var supplychain1 = bridge.connect('/test5/mongo1');

		supplychain1.append(datac).ship(function(){
			supplychain1('city.south').ship(function(cities){
				cities.count().should.equal(3);

				cities.eq(0).remove().ship(function(){

					supplychain1('city.south').ship(function(cities){
						
						cities.count().should.equal(2);
						done();
					})
				})
			})
		})
		

	})

})