"use realm backend";

import route, cors from realm.router.decorators;

import Session as sess from realm.router.test;

@route("/test/:id/:lang?")

class MainRouter {

   static get($params, $query, $body) {
      return $params;
   }
   static put($params, $query, $body) {
      return $params;
   }
}
