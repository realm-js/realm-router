"use realm bridge";
import Permissions as permissions from realm.router.test;

class MyFirstBridge {
   @permissions()
   static getSomething(id) {
      return {
         a: "hello from universal request!",
         id: id
      }
   }
}

export MyFirstBridge;
