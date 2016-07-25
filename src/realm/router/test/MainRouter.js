"use realm backend";

import route, cors from realm.router.decorators;

import Session as sess, Permissions from realm.router.test;

@route(/^\/(?!api|_realm_).*/)

class MainRouter {
   @Permissions()
   static get($params, $query, $permissions, $body) {
      i++;
      return {
         hello: $permissions
      };
   }
   static put($params, $query, $body) {
      return $params;
   }
}
