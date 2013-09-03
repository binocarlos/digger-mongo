/*

	(The MIT License)

	Copyright (C) 2005-2013 Kai Davenport

	Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

 */

var NestedSet = require('digger-nestedset');
var _ = require('lodash');
var async = require('async');

/*

  atomically increment the position for the parent of the next insert

  the id is the parent id - if not specified then we are appending to root

  we use the very first root container to keep track of root positions

  if there are zero things in the database we create it
  
*/
function get_digger_position(collection, id, length, done){

  var query = id ? {
    // we are adding to a specific target
    "_digger.diggerid":id
  } : {
    // we are adding to the top
    "__diggermongo.digger":true
  }

  var update = id ? {
    // we are adding to a specific target
    "_digger.next_position":length
  } : {
    // we are adding to the top
    "__diggermongo.next_position":length
  }

  collection.findAndModify(query, null, {$inc: update}, {new:true}, done);
}

/*

  process a model in a single pass
  
*/
function process_append(model, parent, done){
  
  function process_child(child, parent, position){
    var path = parent._digger.diggerpath.concat([position]);
    child._digger.diggerpath = path;
    child._id = child._digger.diggerid;
    child._digger.diggerparentid = parent._digger.diggerid;
    NestedSet.assign_tree_encodings(child._digger)
    child._digger.next_position = (child._children || []).length;
    _.each(child._children, function(grandchild, j){
      process_child(grandchild, child, j);
    })
  }

  NestedSet.assign_tree_encodings(model._digger)
  model._id = model._digger.diggerid;
  if(parent){
    model._digger.diggerparentid = parent._digger.diggerid;
  }
  model._digger.next_position = (model._children || []).length;
  _.each(model._children, function(child, i){
    process_child(child, model, i);
  })

  var flatappends = [];

  function flatten(model){
    var appendmodel = _.clone(model);
    var children = appendmodel._children;
    delete(appendmodel._children);
    flatappends.push(appendmodel);
    if(children){
      children.forEach(flatten);
    }
  }

  flatten(model);

  done(null, flatappends);

}

module.exports = function(supplier){

  return function(collection, req, reply){

    var contextid = req.context ? (req.context._digger ? req.context._digger.diggerid : req._id) : null;
    var body = req.body || [];

    get_digger_position(collection, contextid, body.length, function(error, obj){

      if(error){
        reply(error);
        return;
      }

      try{
      var base_position = contextid ? obj._digger.next_position : obj.__diggermongo.next_position;
      var start_position = base_position - body.length;
      var base_path = (contextid ? obj._digger.diggerpath : []) || [];
      var context = contextid ? obj : null;



      var fns = _.map(body, function(model, i){
        return function(next){
          model._digger.diggerpath = base_path.concat([start_position + i]);
          process_append(model, context, function(error, appendarray){

            process.nextTick(function(){

              collection.insert(appendarray, {
                '$safe':true
              }, function(error){
                if(error){
                  console.log('-------------------------------------------');
                  console.dir(error);  
                }
                
                next(error, model);
              })
            })
            
            
          });
        }
      })

      async.parallel(fns, function(error, results){

        reply(error, results);

      })
      }catch(e){
        console.log('-------------------------------------------');
        console.log('-------------------------------------------');
        console.dir(e);
        console.log(e.stack);
      }
      
    })

  }
}