"use realm backend-raw";

realm.module("realm.router.utils.path2exp", function() {
   return require('path-to-regexp');
});
realm.module("realm.router.utils.lodash", function() {
   return require("lodash");
});
realm.module("realm.router.utils.Promise", function() {
   return require("promise");
});
realm.module("realm.router.utils.parsetrace", function() {
   return require('parsetrace');
});
realm.module("realm.router.utils.swig", function() {
   return require('swig');
});
realm.module("realm.router.utils.jsep", function() {
   return require('jsep');
});

realm.module("realm.router.utils.logger", function() {
   return require('log4js').getLogger('realm.router');
});
