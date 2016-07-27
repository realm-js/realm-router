(function(___scope___) {
    "use strict";
    var $isBackend = ___scope___.isNode;
    var realm = ___scope___.realm;
})(function(self) {
    var isNode = typeof exports !== 'undefined';
    return {
        isNode: isNode,
        realm: isNode ? require('realm-js') : window.realm
    }
}());
(function(___scope___) {
    "use strict";
    var $isBackend = ___scope___.isNode;
    var realm = ___scope___.realm;
    realm.module("realm.router.Collection", [], function() {
        var $_exports; /* @#realm-source:src/realm/router/Collection.js#*/
        const routeMap = [];
        class Collection {
            static register(path, target) {
                routeMap.push({
                    path: path,
                    target: target
                });
            }
            static getMap() {
                return routeMap;
            }
        }
        $_exports = Collection;
        return $_exports;
    });
    realm.module("realm.router.Decoration", ["realm.router.utils.lodash"], function(_) {
        var $_exports; /* @#realm-source:src/realm/router/Decoration.js#*/
        class Decorator {
            promised() {
                return new Promise((resolve, reject) => {
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
            include(parent, props) {
                var self = this;
                self.services.$attrs = self.services.$attrs || {};
                self.services.$attrs[parent.name] = props.attrs || {};
                return this.decorate(parent).then(function() {
                    return self.promised().then(() => {
                        if (parent.inject) {
                            return realm.require(parent.inject, self.services)
                                .then(results => {
                                    if (_.isPlainObject(results)) {
                                        _.each(results, (obj, key) => {
                                            self.services[key] = obj;
                                        });
                                    }
                                });
                        }
                    }).then(function() {
                        if (parent.intercept) {
                            return realm.require(parent.intercept, self.services).then(function(_ic) {
                                if (_ic !== undefined) {
                                    self.intercepted = _ic;
                                }
                            })
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
            decorate(obj, method) {
                var self = this;
                var intercepted;
                return self.promised()
                    .then(function() {
                        if (!obj.__decorators) {
                            return;
                        }
                        return realm.each(obj.__decorators.cls, function(item) {
                            return self.include(item.decorator, item)
                        }).then(function() {
                            var props = obj.__decorators.props;
                            if (props && props[method]) {
                                var items = props[method];
                                return realm.each(items, function(item) {
                                    return self.include(item.decorator, item);
                                });
                            }
                        });
                    });
            }
        }
        $_exports = Decorator;
        return $_exports;
    });
    realm.module("realm.router.Decorator", ["realm.router.utils.lodash"], function(_) {
        var $_exports; /* @#realm-source:src/realm/router/Decorator.js#*/
        /**
         * Decorator
         * Wraps a class into a function that stores information about
         * the current decorator into instance properties (__decorators)
         */
        class Decorator {
            /**
             * static
             *
             * @param  {type} decorator description
             * @return {type}           description
             */
            static wrap(decorator) {
                return function() {
                    var attrs = _.flatten(arguments);
                    return function(target, property, descriptor) {
                        var decorators = target.__decorators = target.__decorators || {};
                        var collection;
                        if (!property) {
                            collection = (decorators.cls = decorators.cls || []);
                        } else {
                            decorators.props = decorators.props || {};
                            collection = (decorators.props[property] = decorators.props[property] || []);
                        }
                        collection.push({
                            decorator: decorator,
                            attrs: attrs
                        });
                    }
                }
            }
        }
        $_exports = Decorator;
        return $_exports;
    });
    realm.module("realm.router.Dispatcher", ["realm.router.Collection", "realm.router.Decoration", "realm.router.Traceback", "realm.router.RequestInjectors", "realm.router.utils.path2exp", "realm.router.utils.Promise", "realm.router.utils.logger", "realm.router.utils.lodash"], function(Collection, Decoration, Traceback, RequestInjectors, path2exp, Promise, logger, _) {
        var $_exports; /* @#realm-source:src/realm/router/Dispatcher.js#*/
        let PRETTY_TRACE = false;
        /**
         * Router
         */
        class Dispatcher extends Decoration {
            /**
             * constructor - description
             *
             * @param  {type} req  description
             * @param  {type} res  description
             * @param  {type} next description
             * @return {type}      description
             */
            constructor(req, res, next) {
                super();
                this.req = req;
                this.res = res;
                this.next = next;
            }
            /**
             * dispatch - dispatches a route
             *
             * @return {type}  description
             */
            dispatch() {
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
            error(code, message) {
                this.res.status(code).send({
                    error: code,
                    message: message
                });
            }
            /**
             * Invokes a handler
             */
            invoke(item, opts) {
                opts = opts || {};
                var self = this;
                var method = opts.method || self.req.method.toLowerCase();
                var target = item.target[method || "$$notImplemented"];
                if (!item.$$notImplemented) {
                    item.$$notImplemented = () => {
                        return this.error(501, "Not implemented");
                    }
                }
                self.services = {
                    $req: self.req,
                    $res: self.res,
                    $params: opts.params || self._compactParams(item)
                }
                var localInjectors = RequestInjectors.getInjectors()
                _.each(localInjectors, function(fn, name) {
                    self.services[name] = fn(self);
                });
                return self.decorate(item.target, method)
                    .then(function() {
                        if (self.intercepted !== undefined) {
                            return self.res.send(self.intercepted)
                        }
                        return realm.require(item.target[method], self.services)
                            .then(function(response) {
                                if (!response !== undefined) {
                                    if (response.prototype) { // Dealing with chains
                                        var props = Object.getOwnPropertyNames(response.prototype);
                                        if (_.indexOf(props, 'constructor') === 0) {
                                            return realm.chain(response);
                                        }
                                    }
                                    return response;
                                }
                            })
                    }).then(function(response) {
                        return response !== undefined ? self.res.send(response) : undefined;
                    }).catch(function(e) {
                        return Traceback.handle(e, self.res, PRETTY_TRACE);
                    });
            }
            /**
             * Gets suitable candidate
             */
            getCandidate() {
                let routes = Collection.getMap();
                let self = this;
                for (var item in routes) {
                    var info = routes[item];
                    var handler = info.target;
                    let keys = [];
                    var re = path2exp(info.path, keys);
                    var params = re.exec(self.req.path);
                    if (params) {
                        return {
                            params: params,
                            keys: keys,
                            target: handler
                        };
                    }
                }
            }
            /**
             * _compactParams - description
             *
             * @param  {type} item description
             * @return {type}      description
             */
            _compactParams(item) {
                var params = {};
                _.each(item.keys, function(i, index) {
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
            static initRoutes(_package, opts) {
                opts = opts || {};
                PRETTY_TRACE = opts.prettyTrace;
                Dispatcher.usePrettyTrace = opts.prettyTrace;
                var packages = [].concat(_package);
                return realm.each(packages, function(pkg) {
                    return realm.requirePackage(pkg).then(function(_packages) {
                        logger.info("Package '%s' has been successfully required", pkg);
                        logger.info("Injested %s routes", _.keys(_packages).length); //
                    }).catch(function(e) {
                        console.log(e.stack)
                    });
                })
            }
        }
        $_exports = Dispatcher;
        return $_exports;
    });
    realm.module("realm.router.Express", ["realm.router.Dispatcher", "realm.router.RequestInjectors", "realm.router.utils.logger", "realm.router.utils.lodash"], function(Dispatcher, RequestInjectors, logger, _) {
        var $_exports; /* @#realm-source:src/realm/router/Express.js#*/
        var Express = (_package, opt) => {
            Dispatcher.initRoutes(_package, opt);
            RequestInjectors.init("realm.router.injectors");
            // actuall express middleware
            return (req, res, next) => {
                let dispatcher = new Dispatcher(req, res, next);
                return dispatcher.dispatch();
            }
        }
        $_exports = Express;
        return $_exports;
    });
    realm.module("realm.router.RequestInjectors", ["realm.router.utils.lodash"], function(_) {
        var $_exports; /* @#realm-source:src/realm/router/RequestInjectors.js#*/
        let INJECTORS = {};
        /**
         * RequestInjectors
         * Collects local injections
         */
        class RequestInjectors {
            static init(_package) {
                realm.requirePackage(_package).then(function(items) {
                    _.each(items, function(injector) {
                        INJECTORS[injector.injectionName] = injector.inject;
                    });
                }).catch(function(e) {
                    console.log(e.stack)
                })
            }
            static getInjectors() {
                return INJECTORS;
            }
        }
        $_exports = RequestInjectors;
        return $_exports;
    });
    realm.module("realm.router.Traceback", ["realm.router.utils.lodash", "realm.router.utils.swig", "realm.router.utils.parsetrace", "realm.router.utils.logger", "realm.router.utils.chalk", "realm.utils.fs", "realm.utils.appRoot", "realm.utils.path"], function(_, swig, parsetrace, logger, chalk, fs, appRoot, path) {
        var $_exports; /* @#realm-source:src/realm/router/Traceback.js#*/
        // Find related module name
        let findRelatedModule = (frame) => {
            var lines = fs.readFileSync(frame.file).toString().split('\n');
            for (var i = frame.line; i > 0; i--) {
                var mod = lines[i].match(/realm\.module\("([^"']+)/)
                if (mod) {
                    return mod[1];
                }
            }
        }
        class Traceback {
            static handle(e, res, prettyTrace) {
                if (e.stack) {
                    var error = parsetrace(e, {
                        sources: true
                    }).object();
                    if (error.frames[0]) {
                        logger.fatal("Realm server error");
                        var frame = error.frames[0];
                        var moduleName = findRelatedModule(frame);
                        var source = frame.source;
                        var markup = [];
                        _.each(source, function(item, number) {
                            markup.push("\t\t" + number + "\t" + item.code)
                        });
                        console.log("\t" + chalk.bgRed.bold.white(error.error));
                        if (moduleName) {
                            console.log("\t" + chalk.yellow.bold(">> " + moduleName));
                        }
                        console.log(chalk.yellow(markup.join('\n')));
                        console.log("\t" + chalk.green(frame.function) + "\t" + frame.file + ":" + frame.line + ":" + frame.column)
                        for (var i = 1; i < error.frames.length; i++) {
                            var fr = error.frames[i];
                            console.log("\t" + chalk.green(fr.function) + "\t" + fr.file + ":" + fr.line + ":" + fr.column)
                        }
                    }
                } else {
                    logger.fatal(e.stack || e);
                }
                if (e.status) {
                    return res.status(e.status).send(e);
                }
                return res.status(500).send({
                    status: 500,
                    message: "Server Error"
                });
            }
        }
        $_exports = Traceback;
        return $_exports;
    });
    realm.module("realm.router.assert", [], function() {
        var $_exports; /* @#realm-source:src/realm/router/assert.js#*/
        const _throw = function(code, msg) {
            throw {
                status: code,
                message: msg
            };
        }
        class Assert {
            static bad_request(message) {
                return _throw(400, message || "Bad request");
            }
            static unauthorized(message) {
                return _throw(401, message || "Unauthorized");
            }
            static not_found(message) {
                return _throw(404, message || "Not found");
            }
        }
        $_exports = Assert;
        return $_exports;
    });
    realm.module("realm.router.config", [], function() {
        var $_exports; /* @#realm-source:src/realm/router/config.js#*/
        const config = {
            bridge: {
                cors: true
            }
        }
        $_exports = config;
        return $_exports;
    });
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
    realm.module("realm.router.utils.chalk", function() {
        return require('chalk');
    });
    realm.module("realm.router.utils.logger", function() {
        return require('log4js').getLogger('realm.router');
    });
    realm.module("realm.router.test.MainRouter", ["realm.router.decorators.route", "realm.router.decorators.cors", "realm.router.test.Session", "realm.router.test.Permissions"], function(route, cors, sess, Permissions) {
        var $_exports; /* @#realm-source:src/realm/router/test/MainRouter.js#*/
        class MainRouter {
            static get($params, $res, $query, $permissions, $body) {
                return class {
                    setPukka() {
                        return 1;
                    }
                    otherStuff() {
                        //return this.$kill()
                        //return $res.send("hello")
                    }
                }
            }
            static put($params, $query, $body) {
                return $params;
            }
        }
        route(/^\/(?!api|_realm_|favicon.ico).*/)(MainRouter, undefined);
        Permissions()(MainRouter, "get");
        return $_exports;
    });
    realm.module("realm.router.test.MyFirstBridge", ["realm.router.test.Permissions"], function(permissions) {
        var $_exports; /* @#realm-source:src/realm/router/test/MyFirstBridge.js#*/
        class MyFirstBridge {
            static getSomething(id) {
                return {
                    a: "hello from universal request!",
                    id: id
                }
            }
        }
        $_exports = MyFirstBridge;
        permissions()(MyFirstBridge, "getSomething");
        return $_exports;
    });
    realm.module("realm.router.test.Permissions", ["realm.router.Decorator"], function(Decorator) {
        var $_exports; /* @#realm-source:src/realm/router/test/Permissions.js#*/
        class Permissions {
            static inject($req, $attrs) {
                return {
                    $permissions: "this is permissions"
                }
            }
        }
        $_exports = Decorator.wrap(Permissions);
        return $_exports;
    });
    realm.module("realm.router.test.Session", ["realm.router.Decorator", "realm.router.test.Permissions"], function(Decorator, permissions) {
        var $_exports; /* @#realm-source:src/realm/router/test/Session.js#*/
        /**
         * Session
         */
        class Session {
            static inject($req, $permissions, $attrs) {
                return {
                    $session: $attrs
                }
            }
        }
        $_exports = Decorator.wrap(Session);
        permissions()(Session, undefined);
        return $_exports;
    });
    realm.module("realm.router.test.WithCors", ["realm.router.decorators.route", "realm.router.decorators.cors"], function(route, cors) {
        var $_exports; /* @#realm-source:src/realm/router/test/WithCors.js#*/
        class Hello {
            static get($params) {
                return {
                    ok: true
                };
            }
            static put() {
                return {
                    ok: 1
                }
            }
        }
        $_exports = Hello;
        cors()(Hello, undefined);
        route("/api/devauth/:email")(Hello, undefined);
        return $_exports;
    });
    realm.module("realm.router.injectors.Body", [], function() {
        var $_exports; /* @#realm-source:src/realm/router/injectors/Body.js#*/
        class Body {
            static get injectionName() {
                return "$body";
            }
            static inject(dispatcher) {
                return {
                    attrs: dispatcher.req.body,
                    get: function(name) {
                        return dispatcher.req.body[name];
                    }
                }
            }
        }
        $_exports = Body;
        return $_exports;
    });
    realm.module("realm.router.injectors.Query", [], function() {
        var $_exports; /* @#realm-source:src/realm/router/injectors/Query.js#*/
        class Query {
            static get injectionName() {
                return "$query";
            }
            static inject(dispatcher) {
                return {
                    attrs: dispatcher.req.query,
                    get: function(name) {
                        return dispatcher.req.query[name];
                    }
                }
            }
        }
        $_exports = Query;
        return $_exports;
    });
    realm.module("realm.router.decorators.cors", ["realm.router.Decorator"], function(Decorator) {
        var $_exports; /* @#realm-source:src/realm/router/decorators/cors.js#*/
        class Cors {
            static intercept($attrs, $req, $res) {
                var method = $req.method.toLowerCase();
                var setHeaders = function() {
                    $res.header("Access-Control-Allow-Methods", 'POST, GET, OPTIONS, PUT, DELETE');
                    $res.header("Access-Control-Allow-Origin", "*");
                    $res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Session");
                }
                if (method === "options") {
                    setHeaders();
                    return {}
                }
                setHeaders();
            }
        }
        $_exports = Decorator.wrap(Cors)
        return $_exports;
    });
    realm.module("realm.router.decorators.route", ["realm.router.Collection"], function(Collection) {
        var $_exports; /* @#realm-source:src/realm/router/decorators/route.js#*/
        var Route = path => {
            return (target, property, descriptor) => {
                Collection.register(path, target);
            }
        }
        $_exports = Route
        return $_exports;
    });
    realm.module("realm.router.bridge.BridgeExec", ["realm.router.Decoration", "realm.router.Dispatcher", "realm.router.Traceback"], function(Decoration, Dispatcher, Traceback) {
        var $_exports; /* @#realm-source:src/realm/router/bridge/BridgeExec.js#*/
        class BridgeExec extends Decoration {
            constructor(name, method, opts) {
                super();
                this.name = name;
                this.method = method;
                this.opts = opts || {};
                this.args = this.opts.args;
                this.services = {
                    $req: opts.req,
                    $res: opts.res
                };
            }
            /**
             * exec - Executes a bridge
             * Requires target object and applies router decorators
             * Unlike regular rest services, bridge service calls a function
             * and applies defined arguments. The rest services are applied as "this"
             *
             * @return {type}  description
             */
            exec() {
                var self = this;
                return realm.require(self.name, function(obj) {
                    return obj;
                }).then(function(obj) {
                    return self.decorate(obj, self.method).then(function(data) {
                        if (self.intercepted !== undefined) {
                            return self.intercepted;
                        }
                        if (!obj[self.method]) {
                            throw {
                                status: 501,
                                message: "Not implemented"
                            }
                        }
                        return obj[self.method].apply(self.services, self.args);
                    });
                }).catch(function(e) {
                    return Traceback.handle(e, self.services.$res, Dispatcher.usePrettyTrace);
                });
            }
        }
        $_exports = BridgeExec
        return $_exports;
    });
    realm.module("realm.router.bridge.BridgeRoute", ["realm.router.decorators.route", "realm.router.decorators.cors", "realm.router.Dispatcher", "realm.router.config", "realm.router.Decorator", "realm.router.bridge.BridgeExec"], function(route, cors, Dispatcher, config, Decorator, BridgeExec) {
        var $_exports; /* @#realm-source:src/realm/router/bridge/BridgeRoute.js#*/
        class BridgeRoute {
            static post($body, $req, $res, $params) {
                var moduleName = $body.get("bridge");
                var method = $body.get("method");
                var args = $body.get("args");
                var bridge = new BridgeExec(moduleName, method, {
                    args: args,
                    res: $res,
                    req: $req
                });
                return bridge.exec();
            }
        }
        if (config.bridge.cors === true) {
            cors()(BridgeRoute, "post");
        }
        route("/_realm_/bridge/")(BridgeRoute, undefined);
        return $_exports;
    });
})(function(self) {
    var isNode = typeof exports !== 'undefined';
    return {
        isNode: isNode,
        realm: isNode ? require('realm-js') : window.realm
    }
}());