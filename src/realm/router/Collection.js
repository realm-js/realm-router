"use realm backend";

const routeMap = [];

class Collection {
   static register(path, target) {
      routeMap.push({
         path: path,
         target: target
      });
   }
   static getMap() {
      return routeMap;
   }
}

export Collection;
