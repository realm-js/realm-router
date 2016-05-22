"use realm backend";

import Dispatcher, RequestInjectors from realm.router;
import logger, lodash as _ from realm.router.utils;

var Express = (_package, opt) => {
   Dispatcher.initRoutes(_package, opt);
   RequestInjectors.init("realm.router.injectors");

   // actuall express middleware
   return (req, res, next) => {
      let dispatcher = new Dispatcher(req, res, next);
      return dispatcher.dispatch();
   }
}

export Express;
