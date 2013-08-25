digger-mongo
============

Mongo supplier for digger

## installation

	$ npm install digger-mongo

## usage

This library allows you to save digger databases into MongoDB.

```
var Mongo = require('digger-mongo');

// create the supplier
var supplier = Mongo({
	hostname:'127.0.0.1',
  port:27017,
  database:'mydb',
  collection:'mycollection',
  reset:false,
  nocache:false
})

// run a request against the supplier
supplier({
	method:'get',
	url:'/selector'
}, function(error, answer){
	console.log('-------------------------------------------');
	console.log('we have loaded the selector via REST');
})

```

## provisioning

Sometimes it is useful for a supplier to provision the database and/or collection depending upon the url of the request.

For example - imagine I mounted a Mongo supplier onto:

	/mymongosupplier

If I configure it with a specific database and collection then there is no provisioning required - because I have statically assigned what database and collection.

However - if I only configure the database property and leave the collection for provisioning - it will use the url of the request to decide what collection to use:

```js
var supplier = Mongo({
	database:'mydb',
	provision:['collection']
})

supplier({
	method:'get',
	url:'/database_mount/db1234'
}, function(error, result){

})	
```

This allocates **db1234** as the collection name

## licence

MIT