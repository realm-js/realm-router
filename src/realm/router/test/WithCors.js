"use realm backend";

import route, cors from realm.router.decorators;

@cors()
@route("/api/devauth/:email")
class Hello {
   static get($params) {
      return {
         ok: true
      };
   }

   static put() {
      return {
         ok: 1
      }
   }
}
export Hello;
