/*

	(The MIT License)

	Copyright (C) 2005-2013 Kai Davenport

	Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

 */

var NestedSet = require('digger-nestedset');

var start = new Date().getTime();

var maincounter = 0;
function runinsert(){
	for(var i=0; i<10; i++){
		var path = [3245,45,4,432,maincounter];
		maincounter++;
		for(var j=0; j<100; j++){
			var calcpath = path.concat([j])
			for(var k=0; k<100; k++){
				var calcpath2 = calcpath.concat([k])
				var data = {
					diggerpath:calcpath2
				}
				NestedSet.assign_tree_encodings(data);
				if(i==5 && j==50 && k==50){
					console.dir(data);
				}
				//console.dir(calcpath2);
			}
			
		}
	}
}

runinsert();

var end = new Date().getTime();

var gap = end-start;

console.log('-------------------------------------------');
console.dir(gap + ' ms');

var data = {
	diggerpath:[3,54,3,4,657465,456,456,45645,6]
}
NestedSet.assign_tree_encodings(data);

console.dir(data);

