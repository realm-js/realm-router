"use realm backend";

import Collection, Decoration, Traceback, RequestInjectors from realm.router;

import path2exp, Promise, logger, lodash as _ from realm.router.utils;

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
export Dispatcher;
