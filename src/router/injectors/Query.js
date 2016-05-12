"use realm";

class Query {

   static get injectionName() {
      return "$query";
   }

   static inject(dispatcher) {
      return {
         attrs: dispatcher.req.query,
         get: function(name) {
            return dispatcher.req.query[name];
         }
      }
   }
}

export Query;
