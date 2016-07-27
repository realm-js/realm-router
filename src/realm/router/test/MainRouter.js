"use realm backend";

import route, cors from realm.router.decorators;

import Session as sess, Permissions from realm.router.test;

@route(/^\/(?!api|_realm_|favicon.ico).*/)

class MainRouter {
   @Permissions()
   static get($params, $query, $permissions, $body) {
      i++;
      return class {
         setPukka() {
            return 1;
         }
      }
   }
   static put($params, $query, $body) {
      return $params;
   }
}
