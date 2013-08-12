/*

	(The MIT License)

	Copyright (C) 2005-2013 Kai Davenport

	Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

 */

var Mongo = require('../src');


var Reception = require('digger-reception');
var Bridge = require('digger-bridge');

var async = require('async');
var fs = require('fs');

var app = Reception();

var server = app.listen(8799, function(){
	var bridge = Bridge({
		port:8799
	})

	var mongo_supplier = Mongo({
		database:'test',
		reset:true
	});

	mongo_supplier.provision('collection');

	app.digger('/mongo1', mongo_supplier);

	var supplychain1 = bridge.connect('/mongo1/colors');

	var list = [];
	for(var i=0; i<15; i++){
		var data = {
			name:'test' + i,
			_children:[{
				name:'suba' + i,
				_children:[{
					name:'subb' + i
				}]
			}]
		}
		list.push(data);
	}

	var fns = list.map(function(obj){
		
		return function(next){
			var c = bridge.container(obj);
			supplychain1.append(c).ship(function(){
				console.log('-------------------------------------------');
				console.dir(c.attr('name') + ' appended');
			})
		}
	})

	console.log('-------------------------------------------');
	console.dir(fns.length);

	async.parallel(fns, function(error){
		console.log('-------------------------------------------');
		console.log('all done');
	})

})

