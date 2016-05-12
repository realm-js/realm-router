"use realm";

import route, cors from realm.router.decorators;

import Session as sess from realm.test;

@route("/:id?/:sub?")
@cors()

class MainRouter {

   @sess()
   static get($session, $params, $query, $body) {
      return {
         params: $params,
         hello: "world",
         q: $query
      }
   }
}
