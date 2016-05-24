"use realm backend";

const routeMap = {};

class Collection {
   static register(path, target) {
      routeMap[path] = target;
   }

   static getMap() {
      return routeMap;
   }
}

export Collection;
