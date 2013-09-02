/*

	(The MIT License)

	Copyright (C) 2005-2013 Kai Davenport

	Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

 */

/*
  Module dependencies.
*/

var _ = require('lodash');
var async = require('async');

var mongodb = require('mongodb');

module.exports = collection_factory;

/*

  we keep a single database connection per address details
  and spawn a collection from it each time
  
*/
var databases = {};
var collections = {};
var load_callbacks = {};

function collection_factory(options, req, callback){
  var useoptions = _.clone(options);
  var runcallbacks = callback;

  if(req.headers['x-json-resource']){
    for(var prop in req.headers['x-json-resource']){
      useoptions[prop] = req.headers['x-json-resource'][prop];
    }
  }

  get_mongo_collection(useoptions, function(error, collection){

    runcallbacks(error, collection);
    
  })
}

function get_mongo_server(details, callback){
  var server = new mongodb.Server(details.hostname, details.port, {});
  callback(null, server);
}

function get_mongo_database(details, callback){

  var key = details.hostname + ':' + details.port + ':' + details.database;

  var database = databases[key];

  if(database){
    callback(null, database);
    return;
  }

  get_mongo_server(details, function(error, server){
    if(error){
      throw new Error(error);
    }

    new mongodb.Db(details.database, server, {w: 1}).open(function(error, database){
      if(error){
        throw new Error(error);
      }

      
      databases[details.hostname + ':' + details.port + ':' + details.database] = database;    
      callback(error, database);
    });
  })
}

function get_mongo_collection(details, callback){
  var key = details.hostname + ':' + details.port + ':' + details.database + ':' + details.collection;

  var collection = collections[key];

  if(collection && !details.nocache){
    callback(null, collection);
    return;
  }

  if(load_callbacks[key]){
    load_callbacks[key].push(callback);
    return;
  }
  else{
    load_callbacks[key] = [callback];
  }

  function all_callbacks(error, collection){
    var arr = load_callbacks[key];
    delete(load_callbacks[key]);
    arr.forEach(function(fn){
      fn(error, collection);
    })
  }

  get_mongo_database(details, function(error, database){

    var collection = new mongodb.Collection(database, details.collection);

    collection.ensure_meta = function(ready){
      collection.find({
        "__diggermongo.digger":true
      }, null, null).nextObject(function(error, settings){
        
        if(error){
          callback(error);
          return;
        }
        if(!settings){
          settings = {
            __diggermongo:{
              digger:true,
              next_position:0
            }
          }

          collection.insert(settings, {
            '$safe':true
          }, function(error){
            
            if(error){
              callback(error);
              return;
            }
            ready();
          })
        }
        else{
          ready();
        }
      })
    }

    collection.ensure_meta(function(){
      if(!details.nocache){
        collections[details.hostname + ':' + details.port + ':' + details.database + ':' + details.collection] = collection;  
      }
      all_callbacks(null, collection);  
    })

  })
}

    /*
    
      this needs to be better
      

    collection.mapreduce = function(map_reduce_options, map_reduce_callback){

      map_reduce_options = _.extend({}, map_reduce_options);

      var mapReduce = {
        mapreduce: details.collection, 
        out:  { inline : 1 },
        query: map_reduce_options.query,
        map: map_reduce_options.map ? map_reduce_options.map.toString() : null,
        reduce: map_reduce_options.reduce ? map_reduce_options.reduce.toString() : null,
        finalize: map_reduce_options.finalize ? map_reduce_options.finalize.toString() : null
      }

      database.executeDbCommand(mapReduce, function(err, dbres) {

        var results = dbres.documents[0].results

        map_reduce_callback(err, results);
      })
    }    */