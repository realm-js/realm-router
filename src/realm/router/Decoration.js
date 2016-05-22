"use realm backend";
import lodash as _ from realm.router.utils;

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
export Decorator;
