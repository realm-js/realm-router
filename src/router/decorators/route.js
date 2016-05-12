"use realm";

import Collection from realm.router;

var Route = path => {
   return (target, property, descriptor) => {
      Collection.register(path, target);
   }
}
export Route
