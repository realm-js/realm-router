"use realm";

import route, cors from realm.router.decorators;

import Session as sess from realm.test;

@route("/api/panel/intel-translation-save/:id/:lang?")

class MainRouter {

   static get($params, $query, $body) {
      return $params;
   }
   static put($params, $query, $body) {
      return $params;
   }
}
