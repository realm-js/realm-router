"use realm backend";

import route, cors from realm.router.decorators;
import Dispatcher, config, Decorator from realm.router;
import BridgeExec from realm.router.bridge;

@route("/_realm_/bridge/")
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
