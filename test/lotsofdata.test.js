
var digger = require('digger.io');
var diggerdb = require('../src');
var Bridge = require('digger-bridge');
var XML = require('digger-xml');
var data = require('./fixtures/data');
var async = require('async');
var fs = require('fs');
var DB = require('../src/db');

describe('diggerdb', function(){

	it('should do lots of data and stay intact', function(testdone){
		testdone();
		
		/*
		
			30 seconds
			
		
		this.timeout(30 * 1000);
		
		var db = diggerdb({
			database:'bigtest',
			collection:'bigtest',
			url:'/',
			reset:true
		})

		var dbcontainer = Bridge(db).connect();

		var alpha = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];

		function runletter(letter, done){
			var thingcount = 0;
			var things = [];
			for(var i=0; i<100; i++){
				var thing = Bridge.container('thing', {
					index:thingcount
				})
				things.push(thing);
			}

			async.forEach(things, function(thing, nextthing){
				letter.append(thing).ship(function(){
					nextthing();
				})

			}, done)

		}

		function runalpha(done){

			var currentparent = dbcontainer;

			async.forEach(alpha, function(letter, nextletter){
				var thingcount = 0;

				var lettercontainer = Bridge.container('letter', {
					letter:letter
				})

				console.log('-------------------------------------------');
				console.log('letter: ' + letter);

				currentparent.append(lettercontainer).ship(function(){

					runletter(lettercontainer, function(){
						currentparent = lettercontainer;
						nextletter();
					})
				})

				
			}, done)
		}

		runalpha(function(){
			console.log('-------------------------------------------');
			console.log('done');
			dbcontainer('letter thing').ship(function(letters){
				console.log('-------------------------------------------');
				console.log(letters.count() + ' lodaed');
				console.log('-------------------------------------------');
				console.dir(letters.get(1989));
				console.dir(letters.get(1946));
				process.exit();
			})
		})

		*/
				/*
		var rootcontainer = Bridge.container('folder');
		rootcontainer.add(Bridge.container('folder'));

		dbcontainer.append(rootcontainer).ship(function(results){
			console.log('-------------------------------------------');
			console.log(JSON.stringify(results, null, 4));
			process.exit();
		})


		
			add X sets each with Y levels
			
	
		function createdata(){
			return Bridge.container(data);
		}

		function insertdata(sets, levels, alldone){
			

			var currentset = 0;

			async.whilst(
				function(){
					currentset++;
					return currentset<=sets;
				},
				function(nextset){
					var currentlevel = 0;
					var lastcontainer = dbcontainer;

					async.whilst(
						function(){
							currentlevel++;
							return currentlevel<=levels;
						},
						function(nextlevel){
							var appendcontainer = createdata();

							dbcontainer
								.append(appendcontainer)
								.ship(function(){
									
									nextlevel();
								})

							

						},
						nextset
					)
				},
				function(){

					setTimeout(function(){
						dbcontainer('city.south').ship(function(results){
							console.log('-------------------------------------------');
							console.log(JSON.stringify(results.toJSON(), null, 4));
						})
					}, 200)
					/*
					async.parallel({
						poor:function(done){
							dbcontainer('city.south area.poor').ship(function(areas){
								done(null, areas.count());
							})
						},
						rich:function(done){
							dbcontainer('city.north area.rich').ship(function(areas){
								done(null, areas.count());
							})
						}
					}, function(error, results){
						console.log('-------------------------------------------');
						console.dir(results);
						process.exit();
						results.poor.should.equal(459);
						results.rich.should.equal(300);
						alldone();
					})

					
					
				}
			)
		}
		
		insertdata(2, 2, testdone);
			*/
	})

})