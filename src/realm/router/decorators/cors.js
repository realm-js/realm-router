"use realm backend";

import Decorator from realm.router;

class Cors {

   static intercept($attrs, $req, $res) {
      var method = $req.method.toLowerCase();

      if (method === "options") {
         $res.header("Access-Control-Allow-Origin", "*");
         $res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Session");
         return {}
      }
      $res.header("Access-Control-Allow-Origin", "*");
      $res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Session");
   }
}

export Decorator.wrap(Cors)
