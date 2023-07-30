---
title: "Routing, Views and Controllers"
description: "Expose (custom) routes in your package, which call a controller action and render views provided by the package. This chapter will additionally cover testing of routes, controllers, and views."
tags:
  [
    "Routing",
    "Controllers",
    "Views",
    "RESTful",
    "Testing Routing",
    "Testing Controllers",
    "Testing Views",
  ]
image: "https://www.laravelpackage.com/assets/pages/laravelpackage.jpeg"
date: 2019-09-17
---

# Routing

Sometimes you want to expose additional routes to the end-user of your package.

Since we're offering a `Post` model, let's add some **RESTful** routes. To keep things simple, we're just going to implement 3 of the RESTful routes:

- show all posts ('index')
- show a single post ('show')
- store a new post ('store')

## Controllers

### Creating a Base Controller

We want to create a `PostController`.

To make use of some traits the Laravel controllers offer, we'll first create our own base controller containing these traits in a `src/Http/Controllers` directory (resembling Laravel's folder structure) named `Controller.php`:

```php title="src/Http/Controllers/Controller.php"
<?php

namespace JohnDoe\BlogPackage\Http\Controllers;

use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Routing\Controller as BaseController;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class Controller extends BaseController
{
    use AuthorizesRequests, DispatchesJobs, ValidatesRequests;
}
```

### Creating a Controller That Extends Base Controller

Now, let's create a PostController in the `src/Http/Controllers` directory, starting first with the 'store' method:

```php title="src/Http/Controllers/PostController"
<?php

namespace JohnDoe\BlogPackage\Http\Controllers;

class PostController extends Controller
{
    public function index()
    {
        //
    }

    public function show()
    {
        //
    }

    public function store()
    {
        // Let's assume we need to be authenticated
        // to create a new post
        if (! auth()->check()) {
            abort (403, 'Only authenticated users can create new posts.');
        }

        request()->validate([
            'title' => 'required',
            'body'  => 'required',
        ]);

        // Assume the authenticated user is the post's author
        $author = auth()->user();

        $post = $author->posts()->create([
            'title'     => request('title'),
            'body'      => request('body'),
        ]);

        return redirect(route('posts.show', $post));
    }
}
```

## Routes

### Defining Routes

Now that we have a controller, create a new `routes/` directory in our package's root and add a `web.php` file containing the three RESTful routes we've mentioned above.

```php title="routes/web.php"
<?php

use Illuminate\Support\Facades\Route;
use JohnDoe\BlogPackage\Http\Controllers\PostController;

Route::get('/posts', [PostController::class, 'index'])->name('posts.index');
Route::get('/posts/{post}', [PostController::class, 'show'])->name('posts.show');
Route::post('/posts', [PostController::class, 'store'])->name('posts.store');
```

### Registering Routes in the Service Provider

Before we can use these routes, we need to register them in the `boot()` method of our Service Provider:

```php title="BlogPackageServiceProvider.php"
<?php

public function boot()
{
  // ... other things
  $this->loadRoutesFrom(__DIR__.'/../routes/web.php');
}
```

### Configurable Route Prefix and Middleware

You may want to allow users to define a route prefix and middleware for the routes exposed by your package. Instead of registering the routes directly in the `boot()` method we'll register the routes using `Route::group`, passing in the dynamic configuration (prefix and middleware). Don't forget to import the corresponding `Route` facade.

The following examples use a namespace of `blogpackage`. Don't forget to replace this with your package's namespace.

```php title="BlogPackageServiceProvider.php"
<?php

use Illuminate\Support\Facades\Route;

public function boot()
{
  // ... other things
  $this->registerRoutes();
}

protected function registerRoutes()
{
    Route::group($this->routeConfiguration(), function () {
        $this->loadRoutesFrom(__DIR__.'/../routes/web.php');
    });
}

protected function routeConfiguration()
{
    return [
        'prefix' => config('blogpackage.prefix'),
        'middleware' => config('blogpackage.middleware'),
    ];
}
```

Specify a default route prefix and middleware in the package's `config.php` file:

```php
<?php
[
  'prefix' => 'blogger',
  'middleware' => ['web'], // you probably want to include 'web' here
]
```

In the above default configuration, all routes defined in `routes.web` need to be prefixed with `/blogger`. In this way, collision with potentially existing routes is avoided.

## Views

The 'index' and 'show' methods on the `PostController` need to render a view.

### Creating the Blade View Files

Create a new `resources/` folder at the root of our package. In that folder, create a subfolder named `views`. In the views folder, we'll create a `posts` subfolder in which we'll create two (extremely) simple templates.

1. `resources/views/posts/index.blade.php`:

   ```html
   <h1>Showing all Posts</h1>

   @forelse ($posts as $post)
       <li>{{ $post->title }}</li>
   @empty
       <p> 'No posts yet' </p>
   @endforelse
   ```

2. `resources/views/posts/show.blade.php`:

   ```html
   <h1>{{ $post->title }}</h1>

   <p> {{ $post->body }}</p>
   ```

Note: these templates would extend a base/master layout file in a real-world scenario.

### Registering Views in the Service Provider

Now that we have some views, we need to register that we want to load any views from our `resources/views` directory in the `boot()` method of our Service Provider. **Important**: provide a "key" as the second argument to `loadViewsFrom()` as you'll need to specify this key when returning a view from a controller (see next section).

```php title="BlogPackageServiceProvider.php"
<?php

public function boot()
{
  // ... other things
  $this->loadViewsFrom(__DIR__.'/../resources/views', 'blogpackage');
}
```

### Returning a View from the Controller

We can now return the views we've created from the `PostController` (don't forget to import our `Post` model).

Note the `blogpackage::` prefix, which matches the prefix we registered in our Service Provider.

```php title="src/Http/Controllers/PostController.php"
<?php

use JohnDoe\BlogPackage\Models\Post;

public function index()
{
    $posts = Post::all();

    return view('blogpackage::posts.index', compact('posts'));
}

public function show()
{
    $post = Post::findOrFail(request('post'));

    return view('blogpackage::posts.show', compact('post'));
}
```

### Customizable Views

Chances are that you want to be able to let the users of your package _customize_ the views. Similar to the database migrations, the views can be **published** if we register them to be exported in the `boot()` method of our service provider using the 'views' key of the publishes() method:

```php title="BlogPackageServiceProvider.php"
<?php

if ($this->app->runningInConsole()) {
  // Publish views
  $this->publishes([
    __DIR__.'/../resources/views' => resource_path('views/vendor/blogpackage'),
  ], 'views');

}
```

The views can then be exported by users of our package using:

```
php artisan vendor:publish --provider="JohnDoe\BlogPackage\BlogPackageServiceProvider" --tag="views"
```

## View Components

Since Laravel 8, it is possible to generate Blade components using `php artisan make:component MyComponent` which generates a base `MyComponent` class and a Blade `my-component.blade.php` file, which receives all public properties as defined in the `MyComponent` class. These components can then be reused and included in any view using the component syntax: `<x-my-component>` and closing `</x-my-component>` (or the self-closing form). To learn more about Blade components, make sure to check out the Laravel documentation.

In addition to generating Blade components using the artisan command, it is also possible to create a `my-component.blade.php` component without class. These are called anonymous components and are placed in the `views/components` directory by convention.

This section will cover how to provide these type of Blade components in your package.

### Class Based Components

If you want to offer class based View Components in your package, first create a new `View/Components` directory in the `src` folder. Add a new class, for example `Alert.php`.

```php title="src/View/Components/Alert.php"
<?php

namespace JohnDoe\BlogPackage\View\Components;

use Illuminate\View\Component;

class Alert extends Component
{
    public $message;

    public function __construct($message)
    {
        $this->message = $message;
    }

    public function render()
    {
        return view('blogpackage::components.alert');
    }
}
```

Next, create a new `views/components` directory in the `resources` folder. Add a new Blade component `alert.blade.php`:

```html
<div>
  <p>This is an Alert</p>

  <p>{{ $message }}</p>
</div>
```

Next, register the component in the Service Provider by the class and provide a prefix for the components. In our example, using 'blogpackage', the alert component will become available as `<x-blogpackage-alert />`.

```php title="BlogPackageServiceProvider.php"
<?php

use JohnDoe\BlogPackage\View\Components\Alert;

public function boot()
{
  // ... other things
  $this->loadViewComponentsAs('blogpackage', [
    Alert::class,
  ]);
}
```

### Anonymous View Components

If your package provides anonymous components, it suffices to add the `my-component.blade.php` Blade component to `resources/views/components` directory, given that you have specified the `loadViewsFrom` directory in your Service Provider as "resources/views". If you don't already, add the `loadViewsFrom` method to your Service Provider:

```php title="BlogPackageServiceProvider.php"
<?php

public function boot()
{
  // ... other things
  $this->loadViewsFrom(__DIR__.'/../resources/views', 'blogpackage');
}
```

Components (in the `resources/views/components` folder) can now be referenced prefixed by the defined namespace above ("blogpackage"):

```
  <x-blogpackage::alert />
```

### Customizable View Components

In order to let the end user of our package modify the provided Blade component(s), we first need to register the publishables into our Service Provider:

```php title="BlogPackageServiceProvider.php"
<?php

if ($this->app->runningInConsole()) {
  // Publish view components
  $this->publishes([
      __DIR__.'/../src/View/Components/' => app_path('View/Components'),
      __DIR__.'/../resources/views/components/' => resource_path('views/components'),
  ], 'view-components');
}
```

Now, it is possible to publish both files (class and Blade component) using:

```
php artisan vendor:publish --provider="JohnDoe\BlogPackage\BlogPackageServiceProvider" --tag="view-components"
```

Be aware that the end user needs to update the namespaces of the published component class and update the `render()` method to reference the Blade components of the Laravel application directly, instead of referencing the package namespace. Additionally, the Blade component no longer has to be namespaced since it was published to the Laravel application itself.

## Testing Routes

Let’s verify that we can indeed create a post, show a post and show all posts with our provided routes, views, and controllers.

### Feature Test

Create a new Feature test called `CreatePostTest.php` in the `tests/Feature` directory and add the following assertions to verify that authenticated users can indeed create new posts:

```php title="tests/Feature/CreatePostTest.php"
<?php

namespace JohnDoe\BlogPackage\Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use JohnDoe\BlogPackage\Models\Post;
use JohnDoe\BlogPackage\Tests\TestCase;
use JohnDoe\BlogPackage\Tests\User;

class CreatePostTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    function authenticated_users_can_create_a_post()
    {
        // To make sure we don't start with a Post
        $this->assertCount(0, Post::all());

        $author = User::factory()->create();

        $response = $this->actingAs($author)->post(route('posts.store'), [
            'title' => 'My first fake title',
            'body'  => 'My first fake body',
        ]);

        $this->assertCount(1, Post::all());

        tap(Post::first(), function ($post) use ($response, $author) {
            $this->assertEquals('My first fake title', $post->title);
            $this->assertEquals('My first fake body', $post->body);
            $this->assertTrue($post->author->is($author));
            $response->assertRedirect(route('posts.show', $post));
        });
    }
}
```

Additionally, we could verify that we require both a "title" and a "body" attribute when creating a new post:

```php title="tests/Feature/CreatePostTest.php"
<?php

/** @test */
function a_post_requires_a_title_and_a_body()
{
    $author = User::factory()->create();

    $this->actingAs($author)->post(route('posts.store'), [
        'title' => '',
        'body'  => 'Some valid body',
    ])->assertSessionHasErrors('title');

    $this->actingAs($author)->post(route('posts.store'), [
        'title' => 'Some valid title',
        'body'  => '',
    ])->assertSessionHasErrors('body');
}
```

Next, let's verify that unauthenticated users (or "guests") can not create new posts:

```php title="tests/Feature/CreatePostTest.php"
<?php

/** @test */
function guests_can_not_create_posts()
{
    // We're starting from an unauthenticated state
    $this->assertFalse(auth()->check());

    $this->post(route('posts.store'), [
       'title' => 'A valid title',
       'body'  => 'A valid body',
    ])->assertForbidden();
}
```

Finally, let's verify the index route shows all posts, and the show route shows a specific post:

```php title="tests/Feature/CreatePostTest.php"
<?php

/** @test */
function all_posts_are_shown_via_the_index_route()
{
    // Given we have a couple of Posts
    Post::factory()->create([
        'title' => 'Post number 1'
    ]);
    Post::factory()->create([
        'title' => 'Post number 2'
    ]);
    Post::factory()->create([
        'title' => 'Post number 3'
    ]);

    // We expect them to all show up
    // with their title on the index route
    $this->get(route('posts.index'))
        ->assertSee('Post number 1')
        ->assertSee('Post number 2')
        ->assertSee('Post number 3')
        ->assertDontSee('Post number 4');
}

/** @test */
function a_single_post_is_shown_via_the_show_route()
{
    $post = Post::factory()->create([
        'title' => 'The single post title',
        'body'  => 'The single post body',
    ]);

    $this->get(route('posts.show', $post))
        ->assertSee('The single post title')
        ->assertSee('The single post body');
}
```

> Tip: whenever you are getting cryptic error messages from your tests, it might be helpful to disable graceful exception handling to get more insight into the error's origin. You can do so by declaring `$this->withoutExceptionHandling();` at the start of your test.
