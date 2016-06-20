"use realm backend";

import lodash as _ from realm.router.utils;

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

export Decorator;
