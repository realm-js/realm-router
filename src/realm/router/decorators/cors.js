"use realm backend";

import Decorator from realm.router;

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

export Decorator.wrap(Cors)
