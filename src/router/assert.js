"use realm";

const _throw = function(code, msg) {
   throw {
      status: code,
      message: msg
   };
}
class Assert {
   static bad_request(message) {
      return _throw(400, message || "Bad request");
   }
   static unauthorized(message) {
      return _throw(401, message || "Unauthorized");
   }
   static not_found(message) {
      return _throw(404, message || "Not found");
   }
}

export Assert;
