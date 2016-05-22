"use realm frontend";

function argumentArray(_args) {

   return args;
}

class BridgeRequest {

   /**
    * static - Makes request to the server
    * Executes a corresponding module
    * @param  {type} path description
    * @param  {type} json description
    * @return {type}      description
    */
   static connect(path, method, args) {
      var targetArgs = [];
      for (var i = 0; i < args.length; i++) {
         targetArgs[i] = args[i];
      }
      return new Promise(function(resolve, reject) {
         var oReq = new window.XMLHttpRequest();

         oReq.open("POST", "/_realm_/bridge/", true);
         oReq.setRequestHeader('Content-Type', 'application/json');
         var data = {
            bridge: path,
            method: method,
            args: targetArgs
         }
         oReq.onreadystatechange = function() {
            if (oReq.readyState == 4) {
               var response = this.response;
               if (this.status === 200) {
                  return resolve(JSON.parse(response))
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
                  })
               }
            }
         };
         oReq.send(data ? JSON.stringify(data) : '{}');
      });
   }
}
export BridgeRequest;
