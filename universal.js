(function(___scope___) { var $isBackend = ___scope___.isNode; var realm  = ___scope___.realm;
'use strict';

(function (___scope___) {
  var $isBackend = ___scope___.isNode;var realm = ___scope___.realm;
})(function (self) {
  var isNode = typeof exports !== 'undefined';return { isNode: isNode, realm: isNode ? require('realm-js') : self.realm };
}(undefined));
})(function(self){ var isNode = typeof exports !== 'undefined'; return { isNode : isNode, realm : isNode ? require('realm-js') : self.realm}}(this));