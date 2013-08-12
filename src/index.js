/*

	(The MIT License)

	Copyright (C) 2005-2013 Kai Davenport

	Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

 */

var Supplier = require('digger-supplier');
var NestedSet = require('digger-nestedset');
var DB = require('./connection');
var _ = require('lodash');
var async = require('async');
var Load = require('./load');
var Select = require('./select');
var Append = require('./append');
var Save = require('./save');
var Remove = require('./remove');

module.exports = function(options){

	options = _.defaults(options || {}, {
    hostname:'127.0.0.1',
    port:27017,
    database:'digger',
    collection:'test',
    reset:false,
    nocache:false
  })

  var resetmode = options.reset;

	/*
	
		keep a buffer for load requests whilst we are loading
		
	*/
	function handle_factory(fn){
		return function(req, reply){

			DB(options, req, function(error, collection){
				if(error){
					reply(error);
					return;
				}
				if(resetmode){
					collection.drop(function(){
						collection.ensure_meta(function(){
							resetmode = false;
							fn(collection, req, reply);		
						})
					})
				}
				else{
					fn(collection, req, reply);
				}
				
			})
		}
	}

	var supplier = Supplier(options);

	supplier.on('load', handle_factory(Load(supplier)));
	supplier.on('select', handle_factory(Select(supplier)));
	supplier.on('append', handle_factory(Append(supplier)));
	supplier.on('save', handle_factory(Save(supplier)));
	supplier.on('remove', handle_factory(Remove(supplier)));
	
	return supplier;
}