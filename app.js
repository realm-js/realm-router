var express = require('express');
var app = express();
var router = require("./index.js");
var realm = require('realm-js');

realm.require('realm.router.Express', function(router) {

   app.use(router(["realm.test"], {
      prettyTrace: true
   }))
}).catch(function(e) {
   console.log(e.stack)
})

var port = process.env.PORT || 3055;
var server = app.listen(port, function() {
   var host = server.address().address;
   console.log('Example app listening at http://%s:%s', host, port);
});
