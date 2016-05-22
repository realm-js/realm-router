"use realm backend";

import Decorator from realm.router;
import Permissions as permissions from realm.router.test;

@permissions()

/**
 * Session
 */
class Session {

   static inject($req, $permissions, $attrs) {
      return {
         $session: $attrs
      }
   }
}

export Decorator.wrap(Session);
