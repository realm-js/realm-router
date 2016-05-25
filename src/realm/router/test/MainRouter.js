"use realm backend";

import route, cors from realm.router.decorators;

import Session as sess from realm.router.test;

@route(/^\/(?!api|_realm_).*/)

class MainRouter {

   static get($params, $query, $body) {
      return {
         hello: 1
      };
   }
   static put($params, $query, $body) {
      return $params;
   }
}
