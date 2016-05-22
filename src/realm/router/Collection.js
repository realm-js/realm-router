"use realm backend";

const routeMap = new Map();

class Collection {
   static register(path, target) {
      routeMap.set(path, target);
   }

   static getMap() {
      return routeMap;
   }
}

export Collection;
