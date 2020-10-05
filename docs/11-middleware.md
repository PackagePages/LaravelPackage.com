# Middleware

If we look at an incoming HTTP request, this request is processed by Laravel's `index.php` file and sent through a series of pipelines. These include a series of ('before') middleware, where each will perform an action on the incoming request before it eventually reaches the core of the application. From the core, a response is prepared which is post-modified by all registered 'after' middleware before returning the response.

That's why middleware is great for authentication, verifying tokens or applying any other check. Laravel also uses middleware to strip out empty characters from strings and encrypt cookies.

## Creating Middleware

There are basically two types of middleware: 1) acting on the request **before** a response is returned ("Before Middleware"); or 2) acting on the response before returning ("After Middleware").

Before discussing the two types of middleware, first create a new `Middleware` folder in the `src/Http` directory of the package.

## Before Middleware

A _before_ middleware performs an action on the request and then calls the next middleware in line. Generally, a Before Middleware takes the following shape:

```php
<?php

namespace App\Http\Middleware;

use Closure;

class BeforeMiddleware
{
    public function handle($request, Closure $next)
    {
        // Perform action

        return $next($request);
    }
}
```

As an illustration of a before middleware, let's add a middleware which capitalizes a 'title' parameter whenever that is present in the request (which would be silly in a real world application).

Add a file called `CapitalizeTitle.php` which provides a `handle()` method accepting both the current request and a `$next` action:

```php
// 'src/Http/Middleware/CapitalizeTitle.php'
<?php

namespace JohnDoe\BlogPackage\Http\Middleware;

use Closure;

class CapitalizeTitle
{
    public function handle($request, Closure $next)
    {
        if ($request->has('title')) {
            $request->merge([
                'title' => ucfirst($request->title)
            ]);
        }

        return $next($request);
    }
}
```

## Testing Before Middleware

Although we haven't _registered_ the middleware yet and it will not be used in the application, we do want to make sure that the `handle()` method shows the correct behaviour.

Add a new `CapitalizeTitleMiddlewareTest.php` unit test in the `tests/Unit` directory. In this test, we'll assert that a title parameter on a `Request()` will contain the capitalized string after the middleware ran its `handle()` method:

```php
// 'tests/Unit/CapitalizeMiddlewareTest.php'
<?php

namespace JohnDoe\BlogPackage\Tests\Unit;

use Illuminate\Http\Request;
use JohnDoe\BlogPackage\Http\Middleware\CapitalizeTitle;
use JohnDoe\BlogPackage\Tests\TestCase;

class CapitalizeTitleMiddlewareTest extends TestCase
{
    /** @test */
    function it_capitalizes_the_request_title()
    {
        // Given we have a request
        $request = new Request();

        // with  a non-capitalized 'title' parameter
        $request->merge(['title' => 'some title']);

        // when we pass the request to this middleware,
        // it should've capitalized the title
        (new CapitalizeTitle())->handle($request, function ($request) {
            $this->assertEquals('Some title', $request->title);
        });
    }
}
```

## After Middleware

The "after middleware" acts on the response that is returned after passing through all other layers of middleware down the chain. Next, it modifies that response and returns the response. Generally it takes the following form:

```php
<?php

namespace App\Http\Middleware;

use Closure;

class AfterMiddleware
{
    public function handle($request, Closure $next)
    {
        $response = $next($request);

        // Perform action

        return $response;
    }
}
```

## Testing After Middleware

Similar to before middleware, we can unit test after middleware that operate on the `Response` for a given request and modify this request before it is passed down to the next layer of middleware. Given that we have an `InjectHelloWorld` middleware that injects the string 'Hello World' in each response, the following test would assert correct behaviour:

```php
// 'tests/Unit/InjectHelloWorldMiddlewareTest.php'
<?php

namespace JohnDoe\BlogPackage\Tests\Unit;

use Illuminate\Http\Request;
use JohnDoe\BlogPackage\Http\Middleware\InjectHelloWorld;
use JohnDoe\BlogPackage\Tests\TestCase;

class InjectHelloWorldMiddlewareTest extends TestCase
{
    /** @test */
    function it_checks_for_a_hello_word_in_response()
    {
        // Given we have a request
        $request = new Request();

        // when we pass the request to this middleware,
        // the response should contain 'Hello World'
        $response = (new InjectHelloWorld())->handle($request, function ($request) { });

        $this->assertStringContainsString('Hello World', $response);
    }
}
```

Now that we know the `handle()` method does its job correctly, let's look at the two options to register the middleware: **globally** vs. **route specific**.

## Global middleware

Global middleware is as the name implies, globally applied. Each request will pass through these middlewares.

If we want our capitalization check example to be applied globally, we can append this middleware to the `Http\Kernel` from within our package's service provider. Make sure to import the _Http Kernel_ contract, not the _Console Kernel_ contract:

```php
// 'BlogPackageServiceProvider.php'
use Illuminate\Contracts\Http\Kernel;
use JohnDoe\BlogPackage\Http\Middleware\CapitalizeTitle;

public function boot()
{
  // other things ...

  $kernel = $this->app->make(Kernel::class);
  $kernel->pushMiddleware(CapitalizeTitle::class);
}
```

This will push our middleware into the application's array of globally registered middleware.

## Route middleware

In our case, you might argue that we likely don't have a 'title' parameter on each request. Probably even only on requests that are related to creating/updating posts. On top of that, we likely only ever want to apply this middleware to requests related to our blog posts.

However, our example middleware will modify all requests which have a title attribute. This is probably not desired. The solution is to make the middleware route-specific.

Therefore, we can register an alias to this middleware in the resolved Router class, from within the `boot()` method of our service provider.

Here's how to register the `capitalize` alias for this middleware:

```php
// 'BlogPackageServiceProvider.php'
use Illuminate\Routing\Router;
use JohnDoe\BlogPackage\Http\Middleware\CapitalizeTitle;

public function boot()
{
  // other things ...

  $router = $this->app->make(Router::class);
  $router->aliasMiddleware('capitalize', CapitalizeTitle::class);
}
```

We can apply this middleware from within our controller by requiring it from the constructor:

```php
// 'src/Http/Controllers/PostController.php'
class PostController extends Controller
{
    public function __construct()
    {
        $this->middleware('capitalize');
    }

    // other methods... (will use this middleware)
}
```

### Middleware Groups

Additionally, we can push our middleware to certain groups, like `web` or `api`, to make sure our middleware is applied on each route that belongs to these groups.

To do so, tell the router to _push_ the middleware to a specfic group (in this example `web`):

```php
// 'BlogPackageServiceProvider.php'
use Illuminate\Routing\Router;
use JohnDoe\BlogPackage\Http\Middleware\CapitalizeTitle;

public function boot()
{
  // other things ...

  $router = $this->app->make(Router::class);
  $router->pushMiddlewareToGroup('web', CapitalizeTitle::class);
}
```

The route middleware groups of a Laravel application are located in the `App\Http\Kernel` class. When applying this approach, you need to be sure that the consumer(s) of this package have the certain middleware group defined in their application.

## Feature Testing Middleware

Regardless of the fact that we registered the middleware globally or route specifically, we can test that the middleware is indeed applied when making a request.

Add a new test to the `CreatePostTest` feature test, in which we'll assume our non-capitalized title will be capitalized after the request has been made.

```php
// 'tests/Feature/CreatePostTest.php'
/** @test */
function creating_a_post_will_capitalize_the_title()
{
    $author = factory(User::class)->create();

    $this->actingAs($author)->post(route('posts.store'), [
        'title' => 'some title that was not capitalized',
        'body' => 'A valid body',
    ]);

    $post = Post::first();

    // 'New: ' was added by our event listener
    $this->assertEquals('New: Some title that was not capitalized', $post->title);
}
```

With the tests returning green, we've covered adding Middleware to your package.
