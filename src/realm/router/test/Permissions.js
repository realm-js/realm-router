"use realm backend";

import Decorator from realm.router;

class Permissions {
   static inject($req, $attrs) {

      return {
         $permissions: "this is permissions"
      }
   }
}

export Decorator.wrap(Permissions);
