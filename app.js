var express = require('express');
var app = express();
var router = require("./build/backend.js");
var realm = require('realm-js');
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
   extended: true
}));

app.use('/lib/lodash', express.static(__dirname + '/bower_components/lodash'));
app.use('/lib/realm-js', express.static(__dirname + '/node_modules/realm-js'));
app.use('/build', express.static(__dirname + '/build'));

realm.require('realm.router.Express', function(router) {

   app.use(router(["realm.router.test", "realm.router.bridge"], {
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
