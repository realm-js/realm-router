(function(___scope___) { var $isBackend = ___scope___.isNode; var realm  = ___scope___.realm;
"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
   var desc = {};
   Object['ke' + 'ys'](descriptor).forEach(function (key) {
      desc[key] = descriptor[key];
   });
   desc.enumerable = !!desc.enumerable;
   desc.configurable = !!desc.configurable;

   if ('value' in desc || desc.initializer) {
      desc.writable = true;
   }

   desc = decorators.slice().reverse().reduce(function (desc, decorator) {
      return decorator(target, property, desc) || desc;
   }, desc);

   if (context && desc.initializer !== void 0) {
      desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
      desc.initializer = undefined;
   }

   if (desc.initializer === void 0) {
      Object['define' + 'Property'](target, property, desc);
      desc = null;
   }

   return desc;
}

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

realm.module("realm.router.Collection", [], function () {
   var $_exports;

   var routeMap = new Map();

   var Collection = function () {
      function Collection() {
         _classCallCheck(this, Collection);
      }

      _createClass(Collection, null, [{
         key: "register",
         value: function register(path, target) {
            routeMap.set(path, target);
         }
      }, {
         key: "getMap",
         value: function getMap() {
            return routeMap;
         }
      }]);

      return Collection;
   }();

   $_exports = Collection;

   return $_exports;
});
realm.module("realm.router.Decorator", ["realm.router.utils.lodash"], function (_) {
   var $_exports;

   /**
    * Decorator
    * Wraps a class into a function that stores information about
    * the current decorator into instance properties (__decorators)
    */

   var Decorator = function () {
      function Decorator() {
         _classCallCheck(this, Decorator);
      }

      _createClass(Decorator, null, [{
         key: "wrap",


         /**
          * static
          *
          * @param  {type} decorator description
          * @return {type}           description
          */
         value: function wrap(decorator) {
            return function () {
               var attrs = _.flatten(arguments);
               return function (target, property, descriptor) {
                  var decorators = target.__decorators = target.__decorators || {};
                  var collection;
                  if (!property) {
                     collection = decorators.cls = decorators.cls || [];
                  } else {
                     decorators.props = decorators.props || {};
                     collection = decorators.props[property] = decorators.props[property] || [];
                  }
                  collection.push({
                     decorator: decorator,
                     attrs: attrs
                  });
               };
            };
         }
      }]);

      return Decorator;
   }();

   $_exports = Decorator;

   return $_exports;
});
realm.module("realm.router.Dispatcher", ["realm.router.Collection", "realm.router.Traceback", "realm.router.RequestInjectors", "realm.router.utils.path2exp", "realm.router.utils.Promise", "realm.router.utils.logger", "realm.router.utils.lodash"], function (Collection, Traceback, RequestInjectors, path2exp, Promise, logger, _) {
   var $_exports;

   var PRETTY_TRACE = false;
   /**
    * Router
    */

   var Dispatcher = function () {

      /**
       * constructor - description
       *
       * @param  {type} req  description
       * @param  {type} res  description
       * @param  {type} next description
       * @return {type}      description
       */

      function Dispatcher(req, res, next) {
         _classCallCheck(this, Dispatcher);

         this.req = req;
         this.res = res;
         this.next = next;
      }

      /**
       * dispatch - dispatches a route
       *
       * @return {type}  description
       */


      _createClass(Dispatcher, [{
         key: "dispatch",
         value: function dispatch() {
            var item = this.getCandidate(this.req.path);
            if (!item) {
               return this.next();
            }
            return this.invoke(item);
         }

         /**
          * error - sends error directly to express
          *
          * @param  {type} code    description
          * @param  {type} message description
          * @return {type}         description
          */

      }, {
         key: "error",
         value: function error(code, message) {
            this.res.status(code).send({
               error: code,
               message: message
            });
         }
      }, {
         key: "promised",
         value: function promised() {
            return new Promise(function (resolve, reject) {
               return resolve();
            });
         }

         /**
          * include - calls a decorator
          * And decorates a parent object
          * Goes through 2 methods
          * : inject
          *    Addes new services to local injections (expects plain object on the ext)
          * : interecpt
          *    Can prevent method from execution in natural way (non expection)
          *
          * @param  {type} parent description
          * @param  {type} fn     description
          * @return {type}        description
          */

      }, {
         key: "include",
         value: function include(parent, props) {
            var self = this;
            var attrs = props.attrs;
            self.services.$attrs = attrs || {};
            return this.decorate(parent).then(function () {
               return self.promised().then(function () {
                  if (parent.inject) {
                     return realm.require(parent.inject, self.services).then(function (results) {
                        if (_.isPlainObject(results)) {
                           _.each(results, function (obj, key) {
                              self.services[key] = obj;
                           });
                        }
                     });
                  }
               }).then(function () {
                  if (parent.intercept) {
                     return realm.require(parent.intercept, self.services).then(function (_ic) {
                        if (_ic !== undefined) {
                           self.intercepted = _ic;
                        }
                     });
                  }
               });
            });
         }

         /**
          * decorate - decorate an object
          * If method is specified - tries to to get the corresponding method instance
          * @param  {type} obj    description
          * @param  {type} method description
          * @return {type}        description
          */

      }, {
         key: "decorate",
         value: function decorate(obj, method) {
            var self = this;
            var intercepted;
            return self.promised().then(function () {
               if (!obj.__decorators) {
                  return;
               }
               return realm.each(obj.__decorators.cls, function (item) {
                  return self.include(item.decorator, item);
               }).then(function () {
                  var props = obj.__decorators.props;
                  if (props && props[method]) {
                     var items = props[method];
                     return realm.each(items, function (item) {
                        return self.include(item.decorator, item);
                     });
                  }
               });
            });
         }

         /**
          * Invokes a handler
          */

      }, {
         key: "invoke",
         value: function invoke(item) {
            var self = this;
            var method = self.req.method.toLowerCase();
            var target = item.target[method];

            self.services = {
               $req: self.req,
               $res: self.res,
               $params: self._compactParams(item)
            };

            var localInjectors = RequestInjectors.getInjectors();
            _.each(localInjectors, function (fn, name) {
               self.services[name] = fn(self);
            });

            if (!target) {
               return this.error(501, "Not implemented");
            }

            return self.decorate(item.target, method).then(function () {
               if (self.intercepted !== undefined) {
                  return self.res.send(self.intercepted);
               }
               return realm.require(item.target[method], self.services).then(function (response) {
                  if (!response !== undefined) {
                     return self.res.send(response);
                  }
               });
            }).catch(function (e) {
               return Traceback.handle(e, self.res, PRETTY_TRACE);
            });
         }

         /**
          * Gets suitable candidate
          */

      }, {
         key: "getCandidate",
         value: function getCandidate() {
            var routes = Collection.getMap();
            var keys = [];
            var self = this;
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
               for (var _iterator = routes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                  var _step$value = _slicedToArray(_step.value, 2);

                  var path = _step$value[0];
                  var handler = _step$value[1];

                  var re = path2exp(path, keys);
                  var params = re.exec(self.req.path);
                  if (params) {
                     return {
                        params: params,
                        keys: keys,
                        target: handler
                     };
                  }
               }
            } catch (err) {
               _didIteratorError = true;
               _iteratorError = err;
            } finally {
               try {
                  if (!_iteratorNormalCompletion && _iterator.return) {
                     _iterator.return();
                  }
               } finally {
                  if (_didIteratorError) {
                     throw _iteratorError;
                  }
               }
            }
         }

         /**
          * _compactParams - description
          *
          * @param  {type} item description
          * @return {type}      description
          */

      }, {
         key: "_compactParams",
         value: function _compactParams(item) {
            var params = {};
            _.each(item.keys, function (i, index) {
               if (item.params[index + 1] !== undefined) {
                  params[i.name] = item.params[index + 1];
               }
            });
            return params;
         }

         /**
          * static - init routes
          * Require all classes
          * @param  {type} _package description
          * @return {type}          description
          */

      }], [{
         key: "initRoutes",
         value: function initRoutes(_package, opts) {
            opts = opts || {};
            PRETTY_TRACE = opts.prettyTrace;
            return realm.requirePackage(_package).then(function (_packages) {
               logger.info("Package '%s' has been successfully required", _package);
               logger.info("Injested %s routes", _.keys(_packages).length);
            }).catch(function (e) {
               console.log(e.stack);
            });
         }
      }]);

      return Dispatcher;
   }();

   $_exports = Dispatcher;

   return $_exports;
});
realm.module("realm.router.Express", ["realm.router.Dispatcher", "realm.router.RequestInjectors", "realm.router.utils.logger", "realm.router.utils.lodash"], function (Dispatcher, RequestInjectors, logger, _) {
   var $_exports;

   var Express = function Express(_package, opt) {
      Dispatcher.initRoutes(_package, opt);
      RequestInjectors.init("realm.router.injectors");

      // actuall express middleware
      return function (req, res, next) {
         var dispatcher = new Dispatcher(req, res, next);
         return dispatcher.dispatch();
      };
   };

   $_exports = Express;

   return $_exports;
});
realm.module("realm.router.RequestInjectors", ["realm.router.utils.lodash"], function (_) {
   var $_exports;

   var INJECTORS = {};

   /**
    * RequestInjectors
    * Collects local injections
    */

   var RequestInjectors = function () {
      function RequestInjectors() {
         _classCallCheck(this, RequestInjectors);
      }

      _createClass(RequestInjectors, null, [{
         key: "init",
         value: function init(_package) {
            realm.requirePackage(_package).then(function (items) {
               _.each(items, function (injector) {
                  INJECTORS[injector.injectionName] = injector.inject;
               });
            }).catch(function (e) {
               console.log(e.stack);
            });
         }
      }, {
         key: "getInjectors",
         value: function getInjectors() {
            return INJECTORS;
         }
      }]);

      return RequestInjectors;
   }();

   $_exports = RequestInjectors;

   return $_exports;
});
realm.module("realm.router.Traceback", ["realm.router.utils.lodash", "realm.router.utils.swig", "realm.router.utils.parsetrace", "realm.router.utils.logger"], function (_, swig, parsetrace, logger) {
   var $_exports;

   var Traceback = function () {
      function Traceback() {
         _classCallCheck(this, Traceback);
      }

      _createClass(Traceback, null, [{
         key: "handle",
         value: function handle(e, res, prettyTrace) {
            logger.fatal(e.stack || e);
            // If we have a direct error

            if (e.status) {
               return res.status(e.status).send(e);
            }

            if (prettyTrace) {
               if (e.stack) {
                  var error = parsetrace(e, {
                     sources: true
                  }).object();

                  return res.status(500).send(swig.renderFile(__dirname + '/traceback.html', {
                     error: error
                  }));
               }
            }
            return res.status(500).send({
               status: 500,
               message: "Server Error"
            });
         }
      }]);

      return Traceback;
   }();

   $_exports = Traceback;

   return $_exports;
});
realm.module("realm.router.assert", [], function () {
   var $_exports;

   var _throw = function _throw(code, msg) {
      throw {
         status: code,
         message: msg
      };
   };

   var Assert = function () {
      function Assert() {
         _classCallCheck(this, Assert);
      }

      _createClass(Assert, null, [{
         key: "bad_request",
         value: function bad_request(message) {
            return _throw(400, message || "Bad request");
         }
      }, {
         key: "unauthorized",
         value: function unauthorized(message) {
            return _throw(401, message || "Unauthorized");
         }
      }, {
         key: "not_found",
         value: function not_found(message) {
            return _throw(404, message || "Not found");
         }
      }]);

      return Assert;
   }();

   $_exports = Assert;

   return $_exports;
});
realm.module("realm.router.utils.path2exp", function () {
   return require('path-to-regexp');
});
realm.module("realm.router.utils.lodash", function () {
   return require("lodash");
});
realm.module("realm.router.utils.Promise", function () {
   return require("promise");
});
realm.module("realm.router.utils.parsetrace", function () {
   return require('parsetrace');
});
realm.module("realm.router.utils.swig", function () {
   return require('swig');
});
realm.module("realm.router.utils.jsep", function () {
   return require('jsep');
});

realm.module("realm.router.utils.logger", function () {
   return require('log4js').getLogger('realm.router');
});

realm.module("realm.test.MainRouter", ["realm.router.decorators.route", "realm.router.decorators.cors", "realm.test.Session"], function (route, cors, sess) {
   var _dec, _dec2, _dec3, _class, _desc, _value, _class2;

   var $_exports;

   var MainRouter = (_dec = route("/:id?/:sub?"), _dec2 = cors(), _dec3 = sess(), _dec(_class = _dec2(_class = (_class2 = function () {
      function MainRouter() {
         _classCallCheck(this, MainRouter);
      }

      _createClass(MainRouter, null, [{
         key: "get",
         value: function get($session, $params, $query, $body) {
            return {
               params: $params,
               hello: "world",
               q: $query
            };
         }
      }]);

      return MainRouter;
   }(), (_applyDecoratedDescriptor(_class2, "get", [_dec3], Object.getOwnPropertyDescriptor(_class2, "get"), _class2)), _class2)) || _class) || _class);


   return $_exports;
});
realm.module("realm.test.Permissions", ["realm.router.Decorator"], function (Decorator) {
   var $_exports;

   var Permissions = function () {
      function Permissions() {
         _classCallCheck(this, Permissions);
      }

      _createClass(Permissions, null, [{
         key: "inject",
         value: function inject($req) {
            return {
               $permissions: "this is permissions"
            };
         }
      }]);

      return Permissions;
   }();

   $_exports = Decorator.wrap(Permissions);

   return $_exports;
});
realm.module("realm.test.Session", ["realm.router.Decorator", "realm.test.Permissions"], function (Decorator, permissions) {
   var _dec4, _class3;

   var $_exports;

   /**
    * Session
    */
   var Session = (_dec4 = permissions(), _dec4(_class3 = function () {
      function Session() {
         _classCallCheck(this, Session);
      }

      _createClass(Session, null, [{
         key: "inject",
         value: function inject($req, $permissions) {
            return {
               $session: "this is session"
            };
         }
      }]);

      return Session;
   }()) || _class3);


   $_exports = Decorator.wrap(Session);

   return $_exports;
});
realm.module("realm.router.decorators.cors", ["realm.router.Decorator"], function (Decorator) {
   var $_exports;

   var Cors = function () {
      function Cors() {
         _classCallCheck(this, Cors);
      }

      _createClass(Cors, null, [{
         key: "intercept",
         value: function intercept($attrs, $req, $res) {
            var method = $req.method.toLowerCase();

            if (method === "options") {
               $res.header("Access-Control-Allow-Origin", "*");
               $res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Session");
               return {};
            }
            $res.header("Access-Control-Allow-Origin", "*");
            $res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Session");
         }
      }]);

      return Cors;
   }();

   $_exports = Decorator.wrap(Cors);

   return $_exports;
});
realm.module("realm.router.decorators.route", ["realm.router.Collection"], function (Collection) {
   var $_exports;

   var Route = function Route(path) {
      return function (target, property, descriptor) {
         Collection.register(path, target);
      };
   };

   $_exports = Route;

   return $_exports;
});
realm.module("realm.router.injectors.Body", [], function () {
   var $_exports;

   var Body = function () {
      function Body() {
         _classCallCheck(this, Body);
      }

      _createClass(Body, null, [{
         key: "inject",
         value: function inject(dispatcher) {
            return {
               attrs: dispatcher.req.body,
               get: function get(name) {
                  return dispatcher.req.body[name];
               }
            };
         }
      }, {
         key: "injectionName",
         get: function get() {
            return "$body";
         }
      }]);

      return Body;
   }();

   $_exports = Body;

   return $_exports;
});
realm.module("realm.router.injectors.Query", [], function () {
   var $_exports;

   var Query = function () {
      function Query() {
         _classCallCheck(this, Query);
      }

      _createClass(Query, null, [{
         key: "inject",
         value: function inject(dispatcher) {
            return {
               attrs: dispatcher.req.query,
               get: function get(name) {
                  return dispatcher.req.query[name];
               }
            };
         }
      }, {
         key: "injectionName",
         get: function get() {
            return "$query";
         }
      }]);

      return Query;
   }();

   $_exports = Query;

   return $_exports;
});
})(function(self){ var isNode = typeof exports !== 'undefined'; return { isNode : isNode, realm : isNode ? require('realm-js') : self.realm}}(this));