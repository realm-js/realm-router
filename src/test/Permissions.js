"use realm";

import Decorator from realm.router;

class Permissions {
   static inject($req) {
      return {
         $permissions: "this is permissions"
      }
   }
}

export Decorator.wrap(Permissions);
