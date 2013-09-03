/*

	(The MIT License)

	Copyright (C) 2005-2013 Kai Davenport

	Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

 */

var NestedSet = require('digger-nestedset');
var _ = require('lodash');
var operator_functions = require('./operators');

function filterterm(term){
  if(term.$or || term.$and){
    return true;
  }
  return operator_functions[term.operator] ? true : false;
  
}

/*

  this turns abstract SQL into mongo
  
*/
function processterm(term){
  if(_.isArray(term) && term.length>1){
    return {
      '$and':_.map(term, processterm)
    }
  }
  else{
    if(_.isArray(term)){
      term = term[0];
    }
    if(term.$or){
      term.$or = _.map(term.$or, processterm);
      return term;
    }
    else if(term.$and){
      term.$and = _.map(term.$and, processterm);
      return term;
    }
    else{
      return operator_functions[term.operator].apply(null, [term]);    
    }
    
  }
  
}

function generate_mongo_query(selector, context){

  if(!selector){
    return;
  }

	var nestedquery = NestedSet.query_factory(selector, context);

	var search_terms = _.map(_.filter(nestedquery.search, filterterm), processterm);
  var skeleton_terms = _.map(nestedquery.skeleton, processterm);

  var modifier = selector.modifier || {};

  var includedata = modifier.laststep;
  var includechildren = includedata && modifier.tree;

  var iscountermode = false;

  if(search_terms.length<=0){
    return null;
  }

  if(skeleton_terms.length>0 && selector.tag!=='self'){
    if(skeleton_terms.length==1){
      search_terms.push(skeleton_terms[0]);
    }
    else{
      search_terms.push({
        '$or':skeleton_terms
      })
    }
    
  }

  var query = search_terms.length>1 ? {
    '$and':search_terms
  } : search_terms[0]

  var options = {};

  if(modifier.first){
    options.limit = 1;
  }
  else if(modifier.limit){
    var val = '' + modifier.limit;
    if(val.match(/,/)){
      var parts = _.map(val.split(','), function(st){
        return st.replace(/\D/g, '');
      })
      options.skip = parseInt(parts[0], null);
      options.limit = parseInt(parts[1], null);
    }
    else{
      options.limit = modifier.limit;
    }
  }

  if(modifier.count){
    iscountermode = true;
  }

  var usesort = null;

  if(modifier.sort){
    var directions = {
      asc:1,
      desc:-1
    }

    var direction = 1;
    var field = modifier.sort;

    if(_.isBoolean(field)){
      field = null;
    }

    field = (field || '').replace(/ (asc|desc)/i, function(match, dir){
      direction = directions[dir] ? directions[dir] : dir;
      return '';
    })

    field = (field || '').replace(/-/i, function(match, dir){
      direction = -1;
      return '';
    })

    if(!field.match(/\w/)){
      field = 'name';
    }

    var sort = {};
    sort[field] = direction;
    options.sort = sort;
    usesort = sort;
  }

  var fields = includedata ? null : {
    "_digger":true
  }

  function get_tree_query(results){

    /*
    
      only if :tree and there is no :count mode
      
    */
    if(!iscountermode && includechildren && results.length>0){
      // first lets map the results we have by id
      /*
      _.each(results, function(result){
        results_map[result._digger.diggerid] = result;
      })*/

      // now build a descendent query based on the results
      var descendent_tree_query = NestedSet.generate_tree_query('', _.map(results, NestedSet.extractskeleton));
      descendent_tree_query = _.map(descendent_tree_query, processterm);

      var descendent_query = descendent_tree_query.length>1 ? 
        {'$or':descendent_tree_query} :
        {'$and':descendent_tree_query}

      return {
        query:descendent_query,
        fields:null,
        options:{
          sort:usesort
        }
      }
    }
    else{
      return null;
    }
  }

  var ret = {
    query:query,
    fields:fields,
    options:options,
    countermode:iscountermode,
    get_tree_query:get_tree_query
  }

  return ret;
}

function combine_tree_results(results, descendent_results){
  var results_map = {};

  // loop each result and it's links to see if we have a parent in the original results
  // or in these results
  _.each(descendent_results, function(descendent_result){
    results_map[descendent_result._digger.diggerid] = descendent_result;
  })

  _.each(descendent_results, function(descendent_result){
    var parent = results_map[descendent_result._digger.diggerparentid];

    if(parent){
      parent._children = parent._children || [];
      parent._children.push(descendent_result);
    }
  })

  return results;
}

function selectfn(collection, mongoquery, callback){

  var cursor = collection.find(mongoquery.query, mongoquery.fields, mongoquery.options);

  console.log(JSON.stringify(mongoquery.query, null, 4));
  
  /*
  
    if we are in count mode all we want is a count number

    otherwise we want the array of results
    
  */
  var results_method = mongoquery.countermode ? 'count' : 'toArray';

  cursor[results_method].apply(cursor, [function(error, results){

    if(error){
      callback(error);
    }
    else{
      if(mongoquery.countermode){
        results = [{
          count:results
        }]
      }
      callback(null, results);
    }
  }])
  
}

module.exports = function(supplier){
	return function(collection, req, reply){

		var selector = req.selector;
		var context = req.context;

    var select_query = generate_mongo_query(selector, context);
    if(!select_query){
      reply(null, []);
      return;
    }

    var sent = false;
    selectfn(collection, select_query, function(error, results){

      if(error){
        reply(error, []);
        return;
      }

      var treequery = select_query.get_tree_query(results);

      if(!treequery){
        reply(null, results);
        return;
      }
      else{

        selectfn(collection, treequery, function(error, descendent_results){
          if(error){
            reply(error);
            return;
          }

          var finalresults = combine_tree_results(results, descendent_results);

          reply(null, finalresults);
        })
      }  
    })

  }

		
}