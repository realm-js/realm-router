"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function (___scope___) {
   "use strict";
   var $isBackend = ___scope___.isNode;var realm = ___scope___.realm;

   realm.module("realm.router.BridgeRequest", [], function () {
      var $_exports;

      function argumentArray(_args) {

         return args;
      }

      var BridgeRequest = function () {
         function BridgeRequest() {
            _classCallCheck(this, BridgeRequest);
         }

         _createClass(BridgeRequest, null, [{
            key: "connect",


            /**
             * static - Makes request to the server
             * Executes a corresponding module
             * @param  {type} path description
             * @param  {type} json description
             * @return {type}      description
             */
            value: function connect(path, method, args) {
               var targetArgs = [];
               for (var i = 0; i < args.length; i++) {
                  targetArgs[i] = args[i];
               }
               return new Promise(function (resolve, reject) {
                  var oReq = new window.XMLHttpRequest();

                  oReq.open("POST", "/_realm_/bridge/", true);
                  oReq.setRequestHeader('Content-Type', 'application/json');
                  var data = {
                     bridge: path,
                     method: method,
                     args: targetArgs
                  };
                  oReq.onreadystatechange = function () {
                     if (oReq.readyState == 4) {
                        var response = this.response;
                        if (this.status === 200) {
                           return resolve(JSON.parse(response));
                        } else {
                           if (response.indexOf('html') > -1) {
                              var div = document.createElement('div');
                              div.style = 'overflow-y:scroll;position:fixed; top:0; left:0;width:100%;height:100%';
                              div.innerHTML = response;
                              document.body.appendChild(div);
                           }
                           return reject({
                              status: this.status,
                              response: response
                           });
                        }
                     }
                  };
                  oReq.send(data ? JSON.stringify(data) : '{}');
               });
            }
         }]);

         return BridgeRequest;
      }();

      $_exports = BridgeRequest;

      return $_exports;
   });
   realm.module("realm.router.test.MyFirstBridge", ["realm.router.BridgeRequest"], function (BridgeRequest) {
      var $_exports;
      $_exports = {
         'getSomething': function getSomething() {
            return BridgeRequest.connect("realm.router.test.MyFirstBridge", "getSomething", arguments);
         }
      };
      return $_exports;
   });
})(function (self) {
   var isNode = typeof exports !== 'undefined';return { isNode: isNode, realm: isNode ? require('realm-js') : window.realm };
}());