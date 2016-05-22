"use realm backend";

import Decoration, Dispatcher, Traceback from realm.router;

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
export BridgeExec
