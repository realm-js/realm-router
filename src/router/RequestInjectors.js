"use realm"
import lodash as _ from realm.router.utils;

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
export RequestInjectors;
