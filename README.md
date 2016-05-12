# realm-router

Realm router is a bleeding edge restful framework, based on realm dependency injection.


## Features

 * Dependency injection
 * Decorators that support local injection and method interception
 * Promised based (no need in res.send)
 * Automatic method mapping


```js
 "use realm";

 import route, cors from realm.router.decorators;
 import Session as session from realm.test;

 @route("/")
 @cors()

 class MainRouter {

    @session()
    static get($session, $params, $query, $body) {
       return { hello : "world"}
    }
 }
 ```

## Installing

 ```bash
 npm install realm-js realm-router --save
 ```

 Feed realm middleware into express

 ```js
 var realm  = require('realm-js');
 var router = require('realm-router');

 realm.require('realm.router.Express', function(router) {
    app.use(router("your.package.with.routes", {
       prettyTrace: true
    }))
});
  ```

## Routing

Create a class in a dedicated package.
```js
"use realm";
import route from realm.router.decorators;

@route("/")
class MainRouter {
   static get() {
      return { hello : "world"}
   }
}
export MainRouter
```

Use "@route" decorator to define a path. This is pretty straightforward path2regexp.
Each http method corresponds to according static method in the class.
```js
static get() {}
static post() {}
static put() {}
static delete() {}
```

## Route injections

There are few "local" injections that are available


| Name | Description |
| --- | --- |
| $req | express request |
| $res | express response |
| $query | Query getter $query.get('hello') |
| $body | Body getter $body.get('hello') |

You can inject anything else using decorators

## Decorators

Decorators are in realm-router are very powerful thing. You can intercept and inject dependencies into methods;

Let's create a helloWorld decorator
```js
"use realm";

import Decorator from realm.router;
class HelloWorld {

   static inject() {
      return {
         $hello: "my new $hello injection"
      }
   }

   static intercept($query)
   {
      if( $query.get('hello') ){
         return {hello : "intercepted!"}
      }
   }
}

export Decorator.wrap(HelloWorld);
```
### Inject
*inject* method could return an object with injections. The latter ones will be injected into the target


### Intercept
*intercept* method might return an object which will prevent the target route from being executed. An object will be displayed instead.
