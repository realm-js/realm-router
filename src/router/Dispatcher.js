"use realm";

import Collection, Traceback, RequestInjectors from realm.router;

import path2exp, Promise, logger, lodash as _ from realm.router.utils;

let PRETTY_TRACE = false;
/**
 * Router
 */
class Dispatcher {

   /**
    * constructor - description
    *
    * @param  {type} req  description
    * @param  {type} res  description
    * @param  {type} next description
    * @return {type}      description
    */
   constructor(req, res, next) {
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

   /**
    * Invokes a handler
    */
   invoke(item) {
      var self = this;
      var method = self.req.method.toLowerCase();
      var target = item.target[method];

      self.services = {
         $req: self.req,
         $res: self.res,
         $params: self._compactParams(item)
      }

      var localInjectors = RequestInjectors.getInjectors()
      _.each(localInjectors, function(fn, name) {
         self.services[name] = fn(self);
      });

      if (!target) {
         return this.error(501, "Not implemented");
      }

      return self.decorate(item.target, method)
         .then(function() {
            if (self.intercepted !== undefined) {
               return self.res.send(self.intercepted)
            }
            return realm.require(item.target[method], self.services)
               .then(function(response) {
                  if (!response !== undefined) {
                     return self.res.send(response);
                  }
               })
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
      for (let [path, handler] of routes) {
         let keys = [];
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
export Dispatcher;
