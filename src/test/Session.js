"use realm";

import Decorator from realm.router;
import Permissions as permissions from realm.test;

@permissions()

/**
 * Session
 */
class Session {

   static inject($req, $permissions) {
      return {
         $session: "this is session"
      }
   }
}

export Decorator.wrap(Session);
