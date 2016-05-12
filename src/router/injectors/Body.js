"use realm";

class Body {

   static get injectionName() {
      return "$body";
   }

   static inject(dispatcher) {
      return {
         attrs: dispatcher.req.body,
         get: function(name) {
            return dispatcher.req.body[name];
         }
      }
   }
}

export Body;
