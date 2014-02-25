/*

	(The MIT License)

	Copyright (C) 2005-2013 Kai Davenport

	Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

 */

/*

  we use these functions to map what comes out of the nested set supplier in digger

  each on does something like this:

  {
    field:'something',
    operator:'!=',
    value:10
  }

  into this:

  {
    something:{
      '$ne':10
    }
  }
  
*/

var utils = require('digger-utils');

var operator_functions = module.exports = {
  "exists":function(query){
    var ret = {};
    ret[query.field] = {
      '$exists':true
    }
    return ret;
  },
  "=":function(query){
    var ret = {};
    if(!query.value){
      ret[query.field] = query.value;
    }
    else{
      ret[query.field] = new RegExp('^' + utils.escapeRegexp(query.value) + '$', 'i');  
    }
    
    return ret;
  },
  "!=":function(query){
    var ret = {};
    ret[query.field] = {
      '$ne':query.value
    }
    return ret;
  },
  ">":function(query){
    var ret = {};
    ret[query.field] = {
      '$gt':parseFloat(query.value)
    }
    return ret;
  },
  ">=":function(query){
    var ret = {};
    ret[query.field] = {
      '$gte':parseFloat(query.value)
    }
    return ret;
  },
  "<":function(query){
    var ret = {};
    ret[query.field] = {
      '$lt':parseFloat(query.value)
    }
    return ret;
  },
  "<=":function(query){
    var ret = {};
    ret[query.field] = {
      '$lte':parseFloat(query.value)
    }
    return ret;
  },
  "^=":function(query){
    var ret = {};
    ret[query.field] = new RegExp('^' + utils.escapeRegexp(query.value), 'i');
    return ret;
  },
  "$=":function(query){
    var ret = {};
    ret[query.field] = new RegExp(utils.escapeRegexp(query.value) + '$', 'i');
    return ret;
  },
  "~=":function(query){
    var ret = {};
    ret[query.field] = new RegExp('\\W' + utils.escapeRegexp(query.value) + '\\W', 'i');      
    return ret;
  },
  "|=":function(query){
    var ret = {};
    ret[query.field] = new RegExp('^' + utils.escapeRegexp(query.value) + '-', 'i');
    return ret;
  },
  "*=":function(query){
    var ret = {};
    ret[query.field] = new RegExp(utils.escapeRegexp(query.value), 'i');
    return ret;
  }
}